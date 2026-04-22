package handler

import (
	"errors"
	"fmt"
	"haohuynh123-cola/ecommce/internal/domain"
	"haohuynh123-cola/ecommce/internal/dto"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	// You can add fields here if needed, such as a reference to a service layer
	service domain.IAuthService
}

// NewAuthHandler creates a new instance of AuthHandler
func NewAuthHandler(authService domain.IAuthService) *AuthHandler {
	return &AuthHandler{
		service: authService,
	}
}

func (h *AuthHandler) RegisterRoutes(r *gin.Engine) {
	authGroup := r.Group("api/v1/auth")
	authGroup.POST("/login", h.Login)
	authGroup.POST("/register", h.Register)
	authGroup.GET("/me", h.Me)

}

// Login handles user login requests
func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.RequestLogin

	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Println(err)
		c.JSON(400, gin.H{"error ": err.Error()})
		return
	}
	// Implement login logic here
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
	})
}

// Register handles user registration requests
func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RequestRegister

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println(err)
		c.JSON(400, gin.H{"error ": err.Error()})
		return
	}

	// Implement registration logic here
	user, err := h.service.Register(req)

	if err != nil {
		if errors.Is(err, domain.ErrEmailAlreadyExists) {
			c.JSON(409, gin.H{
				"message": "email already exists",
			})
			return
		}

		c.JSON(500, gin.H{
			"message": "internal server error",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Registration successful",
		"user":    user,
	})
}

// Me handles requests to get the current user's information
func (h *AuthHandler) Me(c *gin.Context) {
	// Implement logic to return current user's information here
	c.JSON(http.StatusOK, gin.H{
		"message": "User information",
	})
}
