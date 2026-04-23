package domain

import (
	"context"
	"haohuynh123-cola/ecommce/internal/dto"
)

type IAuthService interface {
	Login(ctx context.Context, req dto.RequestLogin) (*dto.ResponseLogin, error)
	Register(ctx context.Context, req dto.RequestRegister) (*dto.ResponseRegister, error)
	GetMe(ctx context.Context, userID int64) (*dto.ResponseMe, error)
}
