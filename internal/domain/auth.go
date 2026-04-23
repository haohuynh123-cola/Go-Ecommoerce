package domain

import (
	"haohuynh123-cola/ecommce/internal/dto"

	"github.com/gin-gonic/gin"
)

type IAuthService interface {
	Login(req dto.RequestLogin) (*dto.ResponseLogin, error)
	Register(req dto.RequestRegister) (*dto.ResponseRegister, error)
	GetMe(c *gin.Context) (*dto.ResponseMe, error)
}
