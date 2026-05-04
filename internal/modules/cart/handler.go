package cart

import (
	"context"
	"fmt"
	"net/http"
	"time"

	cartdto "haohuynh123-cola/ecommce/internal/modules/cart/dto"
	"haohuynh123-cola/ecommce/internal/platform/config"
	"haohuynh123-cola/ecommce/internal/shared/errs"
	"haohuynh123-cola/ecommce/internal/shared/middleware"
	"haohuynh123-cola/ecommce/internal/shared/response"

	"github.com/gin-gonic/gin"
)

type CartHandler struct {
	// You can add dependencies here, such as services or repositories
	service CartService
	cfg     config.JWTConfig
}

// NewCartHandler creates a new instance of CartHandler
func NewCartHandler(service CartService, cfg config.JWTConfig) *CartHandler {
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
// @Param        addToCartRequest  body      cartdto.AddToCartRequest  true  "Add to cart request"
// @security     BearerAuth
// @Success      200  {object}  response.SuccessResponseSwag
// @Failure      400  {object}  response.ErrorResponseSwag
// @Failure      401  {object}  response.ErrorResponseSwag
// @Failure      500  {object}  response.ErrorResponseSwag
// @Router       /cart/add [post]
func (h *CartHandler) AddToCart(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()
	// Implement logic to add item to cart
	var req cartdto.AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse(errs.ErrCodeInvalidRequest, "invalid request body"))
		return
	}

	userID := c.GetInt64("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse(errs.ErrCodeUnauthorized, "unauthorized"))
		return
	}

	req.UserID = userID

	if err := h.service.AddToCart(ctx, &req); err != nil {
		if err == errs.ErrProductNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse(errs.ErrCodeProductNotFound, "product not found"))
			return
		}
		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, "failed to add item to cart"))
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse("item added to cart successfully"))
}

// GetCartItems handles requests to retrieve cart items for a user
// @Summary      Get cart items
// @Description  Retrieve the list of items in the user's cart
// @Tags         Cart
// @Accept       json
// @Produce      json
// @security     BearerAuth
// @Success      200  {object}  response.SuccessResponseSwag{data=[]cart.CartItem}
// @Failure      401  {object}  response.ErrorResponseSwag
// @Failure      500  {object}  response.ErrorResponseSwag
// @Router       /cart/items [get]
func (h *CartHandler) GetCartItems(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()
	// Implement logic to get cart items for a user
	userID := c.GetInt64("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse(errs.ErrCodeUnauthorized, "unauthorized"))
		return
	}

	items, err := h.service.GetCartItems(ctx, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, "failed to get cart items"))
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse(items))
}

// RemoveFromCart handles requests to remove an item from the cart
// @Summary      Remove item from cart
// @Description  Remove a product from the user's cart
// @Tags         Cart
// @Accept       json
// @Produce      json
// @Param        removeFromCartRequest  body      cartdto.RemoveFromCartRequest  true  "Remove from cart request"
// @security     BearerAuth
// @Success      200  {object}  response.SuccessResponseSwag
// @Failure      400  {object}  response.ErrorResponseSwag
// @Failure      401  {object}  response.ErrorResponseSwag
// @Failure      404  {object}  response.ErrorResponseSwag
// @Failure      500  {object}  response.ErrorResponseSwag
// @Router       /cart/remove [post]
func (h *CartHandler) RemoveFromCart(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()
	// Implement logic to remove item from cart
	var req cartdto.RemoveFromCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse(errs.ErrCodeInvalidRequest, "invalid request body"))
		return
	}

	userID := c.GetInt64("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse(errs.ErrCodeUnauthorized, "unauthorized"))
		return
	}
	req.UserID = userID
	if err := h.service.RemoveFromCart(ctx, &req); err != nil {
		fmt.Printf("Error removing item from cart: %v\n", err)
		if err == errs.ErrProductNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse(errs.ErrCodeProductNotFound, "product not found in cart"))
			return
		}

		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, "failed to remove item from cart"))
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse("item removed from cart successfully"))
}

// UpdateCartItem handles requests to update the quantity of an item in the cart
// @Summary      Update cart item quantity
// @Description  Update the quantity of a product in the user's cart
// @Tags         Cart
// @Accept       json
// @Produce      json
// @Param        updateCartItemRequest  body      cartdto.UpdateCartItemRequest  true  "Update cart item request"
// @Success      200  {object}  response.SuccessResponseSwag
// @Failure      400  {object}  response.ErrorResponseSwag
// @Failure      401  {object}  response.ErrorResponseSwag
// @Failure      404  {object}  response.ErrorResponseSwag
// @Failure      500  {object}  response.ErrorResponseSwag
// @Router       /cart/update [put]
func (h *CartHandler) UpdateCartItem(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()
	// Implement logic to update cart item quantity
	var req cartdto.UpdateCartItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse(errs.ErrCodeInvalidRequest, "invalid request body"))
		return
	}

	userID := c.GetInt64("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse(errs.ErrCodeUnauthorized, "unauthorized"))
		return
	}

	req.UserID = userID

	if err := h.service.UpdateCartItem(ctx, &req); err != nil {
		if err == errs.ErrProductNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse(errs.ErrCodeProductNotFound, "product not found in cart"))
			return
		}
		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, "failed to update cart item"))
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse("cart item updated successfully"))
}

// ClearCart handles requests to clear the cart for a user
// @Summary      Clear cart
// @Description  Remove all items from the user's cart
// @Tags         Cart
// @Accept       json
// @Produce      json
// @Success      200  {object}  response.SuccessResponseSwag
// @Failure      401  {object}  response.ErrorResponseSwag
// @Failure      500  {object}  response.ErrorResponseSwag
// @Router       /cart/clear [post]
func (h *CartHandler) ClearCart(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()
	// Implement logic to clear cart for a user
	userID := c.GetInt64("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse(errs.ErrCodeUnauthorized, "unauthorized"))
		return
	}

	if err := h.service.ClearCart(ctx, userID); err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, "failed to clear cart"))
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse("cart cleared successfully"))
}
