package handler

import (
	"haohuynh123-cola/ecommce/internal/config"
	"haohuynh123-cola/ecommce/internal/domain"
	"haohuynh123-cola/ecommce/internal/dto"
	"haohuynh123-cola/ecommce/internal/middleware"
	"haohuynh123-cola/ecommce/pkg"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CartHandler struct {
	// You can add dependencies here, such as services or repositories
	service domain.CartService
	cfg     config.JWTConfig
}

// NewCartHandler creates a new instance of CartHandler
func NewCartHandler(service domain.CartService, cfg config.JWTConfig) *CartHandler {
	return &CartHandler{
		service: service,
		cfg:     cfg,
	}
}

func (h *CartHandler) RegisterRoutes(r *gin.Engine) {
	cartGroup := r.Group("api/v1/cart")
	cartGroup.Use(middleware.AuthMiddleware(&h.cfg)) // Apply authentication middleware to cart routes
	cartGroup.POST("/add", h.AddToCart)
	cartGroup.GET("/items", h.GetCartItems)
	cartGroup.DELETE("/remove", h.RemoveFromCart)
	cartGroup.PUT("/update", h.UpdateCartItem)
	cartGroup.DELETE("/clear", h.ClearCart)
}

func (h *CartHandler) AddToCart(c *gin.Context) {
	// Implement logic to add item to cart
	var req dto.AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, pkg.ErrorResponse(domain.ErrCodeInvalidRequest, "invalid request body"))
		return
	}

	userID := c.GetInt64("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, pkg.ErrorResponse(domain.ErrCodeUnauthorized, "unauthorized"))
		return
	}

	req.UserID = userID

	if err := h.service.AddToCart(c.Request.Context(), &req); err != nil {
		c.JSON(http.StatusInternalServerError, pkg.ErrorResponse(domain.ErrCodeInternal, "failed to add item to cart"))
		return
	}

	c.JSON(http.StatusOK, pkg.SuccessResponse("item added to cart successfully"))
}

func (h *CartHandler) GetCartItems(c *gin.Context) {
	// Implement logic to get cart items for a user
	userID := c.GetInt64("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, pkg.ErrorResponse(domain.ErrCodeUnauthorized, "unauthorized"))
		return
	}

	items, err := h.service.GetCartItems(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, pkg.ErrorResponse(domain.ErrCodeInternal, "failed to get cart items"))
		return
	}

	c.JSON(http.StatusOK, pkg.SuccessResponse(items))
}

func (h *CartHandler) RemoveFromCart(c *gin.Context) {
	// Implement logic to remove item from cart
}

func (h *CartHandler) UpdateCartItem(c *gin.Context) {
	// Implement logic to update cart item quantity
	var req dto.UpdateCartItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, pkg.ErrorResponse(domain.ErrCodeInvalidRequest, "invalid request body"))
		return
	}

	userID := c.GetInt64("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, pkg.ErrorResponse(domain.ErrCodeUnauthorized, "unauthorized"))
		return
	}

	req.UserID = userID

	if err := h.service.UpdateCartItem(c.Request.Context(), &req); err != nil {
		c.JSON(http.StatusInternalServerError, pkg.ErrorResponse(domain.ErrCodeInternal, "failed to update cart item"))
		return
	}

	c.JSON(http.StatusOK, pkg.SuccessResponse("cart item updated successfully"))
}

func (h *CartHandler) ClearCart(c *gin.Context) {
	// Implement logic to clear cart for a user
}
