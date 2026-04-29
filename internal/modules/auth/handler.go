package auth

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	authdto "haohuynh123-cola/ecommce/internal/modules/auth/dto"
	"haohuynh123-cola/ecommce/internal/platform/config"
	"haohuynh123-cola/ecommce/internal/shared/errs"
	"haohuynh123-cola/ecommce/internal/shared/middleware"
	"haohuynh123-cola/ecommce/internal/shared/response"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	// You can add fields here if needed, such as a reference to a service layer
	service IAuthService
	cfg     config.JWTConfig
}

// NewAuthHandler creates a new instance of AuthHandler
func NewAuthHandler(authService IAuthService, cfg config.JWTConfig) *AuthHandler {
	return &AuthHandler{
		service: authService,
		cfg:     cfg,
	}
}

func (h *AuthHandler) RegisterRoutes(r *gin.Engine) {
	authGroup := r.Group("api/v1/auth")
	authGroup.POST("/login", h.Login)
	authGroup.POST("/register", h.Register)
	authGroup.POST("/verify-otp", h.VerifyOTP)

	authPrivate := r.Group("api/v1/auth")
	authPrivate.Use(middleware.AuthMiddleware(&h.cfg))
	authPrivate.GET("/me", h.Me)

}

// Login handles user login requests
// @Summary      Log in a user
// @Description  Authenticate a user and return a JWT token
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        loginRequest  body      authdto.RequestLogin  true  "Login request"
// @Success      200  {object}  authdto.ResponseLogin
// @Failure      400  {object}  response.ErrorResponseSwag
// @Failure      404  {object}  response.ErrorResponseSwag
// @Failure      500  {object}  response.ErrorResponseSwag
// @Router       /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	var req authdto.RequestLogin

	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Println(err)
		c.JSON(http.StatusBadRequest, response.ValidationError(err))
		return
	}

	user, err := h.service.Login(ctx, req)
	if err != nil {
		if errors.Is(err, errs.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, response.ErrorResponse(errs.ErrCodeUnauthorized, "invalid credentials"))
			return
		}
		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, "internal server error"))
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse(user))

}

// Register handles user registration requests
// @Summary      Register a new user
// @Description  Create a new user account
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        registerRequest  body      authdto.RequestRegister  true  "Registration request"
// @Success      200  {object}  authdto.ResponseRegister
// @Failure      400  {object}  response.ErrorResponseSwag
// @Failure      409  {object}  response.ErrorResponseSwag
// @Failure      500  {object}  response.ErrorResponseSwag
// @Router       /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req authdto.RequestRegister

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, response.ValidationError(err))
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	// Implement registration logic here
	user, err := h.service.Register(ctx, req)

	if err != nil {
		if errors.Is(err, errs.ErrEmailAlreadyExists) {
			c.JSON(http.StatusConflict, response.ErrorResponse(errs.ErrCodeEmailAlreadyExists, "email already exists"))
			return
		}

		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, "internal server error"))
		return
	}
	c.JSON(http.StatusOK, response.SuccessResponse(user))
}

// Me handles requests to get the current user's information
// @Summary      Get current user info
// @Description  Retrieve information about the currently authenticated user
// @Tags         Auth
// @Accept       json
// @Produce      json
// @security     BearerAuth
// @Success      200  {object}  authdto.ResponseMe
// @Failure      401  {object}  response.ErrorResponseSwag
// @Failure      500  {object}  response.ErrorResponseSwag
// @Router       /auth/me [get]
func (h *AuthHandler) Me(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	userID := c.GetInt64("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse(errs.ErrCodeUnauthorized, "unauthorized"))
		return
	}
	// Implement logic to return current user's information here
	user, err := h.service.GetMe(ctx, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, "internal server error"))
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse(user))
}

// VerifyOTP handles requests to verify OTP for registration
// @Summary      Verify OTP for registration
// @Description  Verify the OTP sent to the user's email during registration
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        verifyOTPRequest  body      authdto.RequestVerifyOTP  true  "Verify OTP request"
// @Success      200  {object}  response.SuccessResponseSwag{data=string}
// @Failure      400  {object}  response.ErrorResponseSwag
// @Failure      401  {object}  response.ErrorResponseSwag
// @Failure      500  {object}  response.ErrorResponseSwag
// @Router       /auth/verify-otp [post]
func (h *AuthHandler) VerifyOTP(c *gin.Context) {
	var req authdto.RequestVerifyOTP

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, response.ValidationError(err))
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	_, err := h.service.VerifyOTP(ctx, req)
	if err != nil {
		if errors.Is(err, errs.ErrInvalidOTP) {
			c.JSON(http.StatusUnauthorized, response.ErrorResponse(errs.ErrCodeUnauthorized, "invalid OTP"))
			return
		}
		if errors.Is(err, errs.ErrOTPExpired) {
			c.JSON(http.StatusUnauthorized, response.ErrorResponse(errs.ErrCodeUnauthorized, "OTP expired"))
			return
		}
		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, "internal server error"))
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse("OTP verified successfully"))
}
