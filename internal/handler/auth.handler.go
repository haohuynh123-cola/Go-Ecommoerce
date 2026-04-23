package handler

import (
	"context"
	"errors"
	"fmt"
	"haohuynh123-cola/ecommce/internal/config"
	"haohuynh123-cola/ecommce/internal/domain"
	"haohuynh123-cola/ecommce/internal/dto"
	"haohuynh123-cola/ecommce/internal/middleware"
	"haohuynh123-cola/ecommce/pkg"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	// You can add fields here if needed, such as a reference to a service layer
	service domain.IAuthService
	cfg     config.JWTConfig
}

// NewAuthHandler creates a new instance of AuthHandler
func NewAuthHandler(authService domain.IAuthService, cfg config.JWTConfig) *AuthHandler {
	return &AuthHandler{
		service: authService,
		cfg:     cfg,
	}
}

func (h *AuthHandler) RegisterRoutes(r *gin.Engine) {
	authGroup := r.Group("api/v1/auth")
	authGroup.POST("/login", h.Login)
	authGroup.POST("/register", h.Register)

	auth := r.Group("api/v1/auth")
	auth.Use(middleware.AuthMiddleware(&h.cfg))
	auth.GET("/me", h.Me)

}

// Login handles user login requests
func (h *AuthHandler) Login(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	var req dto.RequestLogin

	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Println(err)
		c.JSON(http.StatusBadRequest, pkg.ValidationError(err))
		return
	}

	user, err := h.service.Login(ctx, req)
	if err != nil {
		if errors.Is(err, domain.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, pkg.ErrorResponse(domain.ErrCodeUnauthorized, "invalid credentials"))
			return
		}
		c.JSON(http.StatusInternalServerError, pkg.ErrorResponse(domain.ErrCodeInternal, "internal server error"))
		return
	}

	c.JSON(http.StatusOK, pkg.SuccessResponse(user))

}

// Register handles user registration requests
func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RequestRegister

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, pkg.ValidationError(err))
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	// Implement registration logic here
	user, err := h.service.Register(ctx, req)

	if err != nil {
		if errors.Is(err, domain.ErrEmailAlreadyExists) {
			c.JSON(http.StatusConflict, pkg.ErrorResponse(domain.ErrCodeEmailAlreadyExists, "email already exists"))
			return
		}

		c.JSON(http.StatusInternalServerError, pkg.ErrorResponse(domain.ErrCodeInternal, "internal server error"))
		return
	}
	c.JSON(http.StatusOK, pkg.SuccessResponse(user))
}

// Me handles requests to get the current user's information
func (h *AuthHandler) Me(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	userID := c.GetInt64("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, pkg.ErrorResponse(domain.ErrCodeUnauthorized, "unauthorized"))
		return
	}
	// Implement logic to return current user's information here
	user, err := h.service.GetMe(ctx, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, pkg.ErrorResponse(domain.ErrCodeInternal, "internal server error"))
		return
	}

	c.JSON(http.StatusOK, pkg.SuccessResponse(user))

}
