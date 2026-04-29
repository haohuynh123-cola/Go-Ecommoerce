package service

import (
	"context"
	"haohuynh123-cola/ecommce/internal/cache"
	"haohuynh123-cola/ecommce/internal/config"
	"haohuynh123-cola/ecommce/internal/crypto"
	"haohuynh123-cola/ecommce/internal/domain"
	"haohuynh123-cola/ecommce/internal/dto"
	"haohuynh123-cola/ecommce/pkg"
	"log"
	"time"
)

type AuthService struct {
	repo      domain.IUserRepository
	secretKey string
	rdb       *cache.UserCache
	smtp      config.SMTPConfig
}

func NewAuthService(repository domain.IUserRepository, secretKey string, rdb *cache.UserCache, smtp config.SMTPConfig) domain.IAuthService {
	return &AuthService{
		repo:      repository,
		secretKey: secretKey,
		rdb:       rdb,
		smtp:      smtp,
	}
}

func (as *AuthService) Login(ctx context.Context, req dto.RequestLogin) (*dto.ResponseLogin, error) {
	//Find user by email
	user, err := as.repo.FindUserByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}

	if user == nil {
		return nil, domain.ErrInvalidCredentials
	}
	//Compare password
	err = crypto.CheckPasswordHash(req.Password, user.Password)
	if err != nil {
		return nil, domain.ErrInvalidCredentials
	}

	//generate token
	token, err := crypto.GenerateTokenJWT(as.secretKey, user.ID, user.Name, user.Email)
	if err != nil {
		return nil, err
	}

	return &dto.ResponseLogin{
		ID:    user.ID,
		Email: user.Email,
		Name:  user.Name,
		Token: token,
	}, nil
}

func (as *AuthService) Register(ctx context.Context, req dto.RequestRegister) (*dto.ResponseRegister, error) {
	emailExist, err := as.repo.FindUserByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	//If email exist return error
	if emailExist != nil {
		return nil, domain.ErrEmailAlreadyExists
	}
	//Hash password
	password, err := crypto.HashPassword(req.Password)

	if err != nil {
		return nil, err
	}
	//Format request DTO to Domain User
	user := &domain.User{
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

		if err := pkg.SendEmail(as.smtp, req.Email, otp); err != nil {
			log.Printf("Failed to send OTP email: %v", err)
		}
	}()

	return &dto.ResponseRegister{
		ID:    createdUser.ID,
		Email: createdUser.Email,
		Name:  createdUser.Name,
	}, nil
}

func (as *AuthService) GetMe(ctx context.Context, userID int64) (*dto.ResponseMe, error) {
	//Get user from context
	if userID == 0 {
		return nil, domain.ErrTokenInvalid
	}

	user, err := as.repo.FindUserByID(ctx, userID)
	if err != nil {
		return nil, domain.ErrTokenInvalid
	}

	return &dto.ResponseMe{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}, nil
}

func (as *AuthService) VerifyOTP(ctx context.Context, req dto.RequestVerifyOTP) (bool, error) {
	//Get OTP from cache
	cachedOTP, found, err := as.rdb.GetOTPRegister(ctx, req.Email)
	if err != nil {
		return false, err
	}
	if !found {
		return false, domain.ErrOTPExpired
	}
	if cachedOTP != req.OTP {
		return false, domain.ErrInvalidOTP
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
