package domain

import (
	"haohuynh123-cola/ecommce/internal/dto"
)

type IAuthService interface {
	Login(req dto.RequestLogin) error
	Register(req dto.RequestRegister) (*dto.ResponseRegister, error)
}
