package service

import (
	"haohuynh123-cola/ecommce/internal/crypto"
	"haohuynh123-cola/ecommce/internal/domain"
	"haohuynh123-cola/ecommce/internal/dto"
)

type AuthService struct {
	repo domain.IUserRepository
}

func NewAuthService(repository domain.IUserRepository) domain.IAuthService {
	return &AuthService{
		repo: repository,
	}
}

func (as *AuthService) Login(req dto.RequestLogin) error {

	return nil

}

func (as *AuthService) Register(req dto.RequestRegister) (*dto.ResponseRegister, error) {
	//Check Email exist
	emailExist, err := as.repo.FindUserByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	//If email exist return error
	if emailExist != false {
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

	createdUser, err := as.repo.CreateUser(user)
	if err != nil {
		return nil, err
	}

	return &dto.ResponseRegister{
		ID:    createdUser.ID,
		Email: createdUser.Email,
		Name:  createdUser.Name,
	}, nil
}
