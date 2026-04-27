package handler

import (
	"fmt"
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
	cartGroup.POST("/remove", h.RemoveFromCart)
	cartGroup.PUT("/update", h.UpdateCartItem)
	cartGroup.POST("/clear", h.ClearCart)
}

// AddToCart handles requests to add an item to the cart
// @Summary      Add item to cart
// @Description  Add a product to the user's cart with specified quantity
// @Tags         Cart
// @Accept       json
// @Produce      json
// @Param        addToCartRequest  body      dto.AddToCartRequest  true  "Add to cart request"
// @Success      200  {object}  pkg.SuccessResponseSwag
// @Failure      400  {object}  pkg.ErrorResponseSwag
// @Failure      401  {object}  pkg.ErrorResponseSwag
// @Failure      500  {object}  pkg.ErrorResponseSwag
// @Router       /cart/add [post]
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

// GetCartItems handles requests to retrieve cart items for a user
// @Summary      Get cart items
// @Description  Retrieve the list of items in the user's cart
// @Tags         Cart
// @Accept       json
// @Produce      json
// @Success      200  {object}  pkg.SuccessResponseSwag{data=[]domain.CartItem}
// @Failure      401  {object}  pkg.ErrorResponseSwag
// @Failure      500  {object}  pkg.ErrorResponseSwag
// @Router       /cart/items [get]
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

// RemoveFromCart handles requests to remove an item from the cart
// @Summary      Remove item from cart
// @Description  Remove a product from the user's cart
// @Tags         Cart
// @Accept       json
// @Produce      json
// @Param        removeFromCartRequest  body      dto.RemoveFromCartRequest  true  "Remove from cart request"
// @Success      200  {object}  pkg.SuccessResponseSwag
// @Failure      400  {object}  pkg.ErrorResponseSwag
// @Failure      401  {object}  pkg.ErrorResponseSwag
// @Failure      404  {object}  pkg.ErrorResponseSwag
// @Failure      500  {object}  pkg.ErrorResponseSwag
// @Router       /cart/remove [post]
func (h *CartHandler) RemoveFromCart(c *gin.Context) {
	// Implement logic to remove item from cart
	var req dto.RemoveFromCartRequest
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
	if err := h.service.RemoveFromCart(c.Request.Context(), &req); err != nil {
		fmt.Printf("Error removing item from cart: %v\n", err)
		if err == domain.ErrProductNotFound {
			c.JSON(http.StatusNotFound, pkg.ErrorResponse(domain.ErrCodeProductNotFound, "product not found in cart"))
			return
		}

		c.JSON(http.StatusInternalServerError, pkg.ErrorResponse(domain.ErrCodeInternal, "failed to remove item from cart"))
		return
	}

	c.JSON(http.StatusOK, pkg.SuccessResponse("item removed from cart successfully"))
}

// UpdateCartItem handles requests to update the quantity of an item in the cart
// @Summary      Update cart item quantity
// @Description  Update the quantity of a product in the user's cart
// @Tags         Cart
// @Accept       json
// @Produce      json
// @Param        updateCartItemRequest  body      dto.UpdateCartItemRequest  true  "Update cart item request"
// @Success      200  {object}  pkg.SuccessResponseSwag
// @Failure      400  {object}  pkg.ErrorResponseSwag
// @Failure      401  {object}  pkg.ErrorResponseSwag
// @Failure      404  {object}  pkg.ErrorResponseSwag
// @Failure      500  {object}  pkg.ErrorResponseSwag
// @Router       /cart/update [put]
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
		if err == domain.ErrProductNotFound {
			c.JSON(http.StatusNotFound, pkg.ErrorResponse(domain.ErrCodeProductNotFound, "product not found in cart"))
			return
		}
		c.JSON(http.StatusInternalServerError, pkg.ErrorResponse(domain.ErrCodeInternal, "failed to update cart item"))
		return
	}

	c.JSON(http.StatusOK, pkg.SuccessResponse("cart item updated successfully"))
}

// ClearCart handles requests to clear the cart for a user
// @Summary      Clear cart
// @Description  Remove all items from the user's cart
// @Tags         Cart
// @Accept       json
// @Produce      json
// @Success      200  {object}  pkg.SuccessResponseSwag
// @Failure      401  {object}  pkg.ErrorResponseSwag
// @Failure      500  {object}  pkg.ErrorResponseSwag
// @Router       /cart/clear [post]
func (h *CartHandler) ClearCart(c *gin.Context) {
	// Implement logic to clear cart for a user
	userID := c.GetInt64("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, pkg.ErrorResponse(domain.ErrCodeUnauthorized, "unauthorized"))
		return
	}

	if err := h.service.ClearCart(c.Request.Context(), userID); err != nil {
		c.JSON(http.StatusInternalServerError, pkg.ErrorResponse(domain.ErrCodeInternal, "failed to clear cart"))
		return
	}

	c.JSON(http.StatusOK, pkg.SuccessResponse("cart cleared successfully"))
}
