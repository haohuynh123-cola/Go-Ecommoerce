package service

import (
	"context"
	"haohuynh123-cola/ecommce/internal/crypto"
	"haohuynh123-cola/ecommce/internal/domain"
	"haohuynh123-cola/ecommce/internal/dto"
)

type AuthService struct {
	repo      domain.IUserRepository
	secretKey string
}

func NewAuthService(repository domain.IUserRepository, secretKey string) domain.IAuthService {
	return &AuthService{
		repo:      repository,
		secretKey: secretKey,
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
	//Check Email exist
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
