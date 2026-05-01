package auth

import (
	"context"
	"log"
	"time"

	authdto "haohuynh123-cola/ecommce/internal/modules/auth/dto"
	"haohuynh123-cola/ecommce/internal/platform/config"
	"haohuynh123-cola/ecommce/internal/shared/crypto"
	"haohuynh123-cola/ecommce/internal/shared/errs"
	"haohuynh123-cola/ecommce/internal/shared/mailer"
)

type AuthService struct {
	repo      IUserRepository
	secretKey string
	rdb       *UserCache
	smtp      config.SMTPConfig
	oauth     config.OAuthConfig
}

func NewAuthService(repository IUserRepository, secretKey string, rdb *UserCache, smtp config.SMTPConfig, oauth config.OAuthConfig) IAuthService {
	return &AuthService{
		repo:      repository,
		secretKey: secretKey,
		rdb:       rdb,
		smtp:      smtp,
		oauth:     oauth,
	}
}

func (as *AuthService) Login(ctx context.Context, req authdto.RequestLogin) (*authdto.ResponseLogin, error) {
	//Find user by email
	user, err := as.repo.FindUserByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}

	if user == nil {
		return nil, errs.ErrInvalidCredentials
	}

	if !user.Verify {
		return nil, errs.ErrEmailNotVerified
	}
	//Compare password
	err = crypto.CheckPasswordHash(req.Password, user.Password)
	if err != nil {
		return nil, errs.ErrInvalidCredentials
	}

	//generate token
	token, err := crypto.GenerateTokenJWT(as.secretKey, user.ID, user.Name, user.Email)
	if err != nil {
		return nil, err
	}

	return &authdto.ResponseLogin{
		ID:    user.ID,
		Email: user.Email,
		Name:  user.Name,
		Token: token,
	}, nil
}

// LoginWithGoogle validates a Google-issued ID token and signs the user in,
// auto-provisioning a verified account on first use.
func (as *AuthService) LoginWithGoogle(ctx context.Context, req authdto.RequestGoogleLogin) (*authdto.ResponseLogin, error) {
	if as.oauth.Google.ClientID == "" {
		return nil, errs.ErrInvalidGoogleToken
	}

	payload, err := verifyGoogleIDToken(ctx, req.IDToken)
	if err != nil {
		return nil, errs.ErrInvalidGoogleToken
	}
	if payload.Aud != as.oauth.Google.ClientID {
		return nil, errs.ErrInvalidGoogleToken
	}
	if payload.IsExpired(time.Now()) {
		return nil, errs.ErrInvalidGoogleToken
	}
	if !payload.IsEmailVerified() || payload.Email == "" {
		return nil, errs.ErrInvalidGoogleToken
	}

	user, err := as.repo.FindUserByEmail(ctx, payload.Email)
	if err != nil {
		return nil, err
	}

	if user == nil {
		// Provision a new user. Password is left blank; password-based login
		// will fail because bcrypt cannot match an empty hash.
		created, err := as.repo.CreateUser(ctx, &User{
			Email:    payload.Email,
			Name:     payload.Name,
			Password: "",
		})
		if err != nil {
			return nil, err
		}
		if err := as.repo.VerifyUserByEmail(ctx, created.Email, true); err != nil {
			return nil, err
		}
		created.Verify = true
		user = created
	} else if !user.Verify {
		if err := as.repo.VerifyUserByEmail(ctx, user.Email, true); err != nil {
			return nil, err
		}
		user.Verify = true
	}

	token, err := crypto.GenerateTokenJWT(as.secretKey, user.ID, user.Name, user.Email)
	if err != nil {
		return nil, err
	}

	return &authdto.ResponseLogin{
		ID:    user.ID,
		Email: user.Email,
		Name:  user.Name,
		Token: token,
	}, nil
}

func (as *AuthService) Register(ctx context.Context, req authdto.RequestRegister) (*authdto.ResponseRegister, error) {
	emailExist, err := as.repo.FindUserByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	//If email exist return error
	if emailExist != nil {
		return nil, errs.ErrEmailAlreadyExists
	}
	//Hash password
	password, err := crypto.HashPassword(req.Password)

	if err != nil {
		return nil, err
	}
	//Format request DTO to Domain User
	user := &User{
		Email:    req.Email,
		Name:     req.Name,
		Password: password,
	}

	createdUser, err := as.repo.CreateUser(ctx, user)
	if err != nil {
		return nil, err
	}
	otp := crypto.GenerateOTP()

	if err := as.rdb.SetOTPRegister(ctx, req.Email, otp, 5*time.Minute); err != nil {
		return nil, err
	}

	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("Recovered from panic in send email: %v", r)
			}
		}()

		if err := mailer.SendEmail(as.smtp, req.Email, otp); err != nil {
			log.Printf("Failed to send OTP email: %v", err)
		}
	}()

	return &authdto.ResponseRegister{
		ID:    createdUser.ID,
		Email: createdUser.Email,
		Name:  createdUser.Name,
	}, nil
}

func (as *AuthService) GetMe(ctx context.Context, userID int64) (*authdto.ResponseMe, error) {
	//Get user from context
	if userID == 0 {
		return nil, errs.ErrTokenInvalid
	}

	user, err := as.repo.FindUserByID(ctx, userID)
	if err != nil {
		return nil, errs.ErrTokenInvalid
	}

	return &authdto.ResponseMe{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}, nil
}

func (as *AuthService) VerifyOTP(ctx context.Context, req authdto.RequestVerifyOTP) (bool, error) {
	//Get OTP from cache
	cachedOTP, found, err := as.rdb.GetOTPRegister(ctx, req.Email)
	if err != nil {
		return false, err
	}
	if !found {
		return false, errs.ErrOTPExpired
	}
	if cachedOTP != req.OTP {
		return false, errs.ErrInvalidOTP
	}

	// Mark user as verified in the database
	if err := as.repo.VerifyUserByEmail(ctx, req.Email, true); err != nil {
		return false, err
	}

	// Clear OTP after successful verification
	if err := as.rdb.ClearOTPRegister(ctx, req.Email); err != nil {
		log.Printf("Failed to clear OTP from cache: %v", err)
	}

	return true, nil
}

func (as *AuthService) ResendOTP(ctx context.Context, req authdto.RequestResendOTP) (bool, error) {
	emailExist, err := as.repo.FindUserByEmail(ctx, req.Email)
	if err != nil {
		return false, err
	}
	//If email not exist return error
	if emailExist == nil {
		return false, errs.ErrEmailNotFound
	}

	if emailExist.Verify {
		return false, errs.ErrEmailAlreadyVerified
	}

	otp := crypto.GenerateOTP()

	if err := as.rdb.SetOTPRegister(ctx, req.Email, otp, 5*time.Minute); err != nil {
		return false, err
	}

	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("Recovered from panic in send email: %v", r)
			}
		}()

		if err := mailer.SendEmail(as.smtp, req.Email, otp); err != nil {
			log.Printf("Failed to send OTP email: %v", err)
		}
	}()

	return true, nil
}
