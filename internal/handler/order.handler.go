package handler

import (
	"haohuynh123-cola/ecommce/internal/config"
	"haohuynh123-cola/ecommce/internal/domain"
	"haohuynh123-cola/ecommce/internal/dto"
	"haohuynh123-cola/ecommce/internal/middleware"
	"haohuynh123-cola/ecommce/pkg"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	service domain.OrderService
	cfg     config.JWTConfig
}

func NewOrderHandler(service domain.OrderService, cfg config.JWTConfig) *OrderHandler {
	return &OrderHandler{
		service: service,
		cfg:     cfg,
	}
}

func (h *OrderHandler) RegisterOrderRoutes(r *gin.Engine) {
	orderGroup := r.Group("/api/v1/orders")
	orderGroup.Use(middleware.AuthMiddleware(&h.cfg)) // Apply authentication middleware to order routes
	orderGroup.POST("/", h.CreateOrder)
	orderGroup.GET("/", h.GetOrdersByUserID)
	orderGroup.GET("/:id", h.GetOrderByID) // Optional: Get order details by order ID
}

func (h *OrderHandler) CreateOrder(c *gin.Context) {
	// Implement logic to create a new order
	userID := c.GetInt64("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, pkg.ErrorResponse(domain.ErrCodeUnauthorized, "unauthorized"))
		return
	}

	var req dto.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, pkg.ErrorResponse(domain.ErrCodeInvalidRequest, err.Error()))
		return
	}

	req.UserID = userID

	order, err := h.service.CreateOrder(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, pkg.ErrorResponse(domain.ErrCodeInternal, "failed to create order"))
		return
	}

	c.JSON(http.StatusOK, pkg.SuccessResponse(order))
}

func (h *OrderHandler) GetOrdersByUserID(c *gin.Context) {
	// Implement logic to retrieve orders by user ID
	userID := c.GetInt64("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, pkg.ErrorResponse(domain.ErrCodeUnauthorized, "unauthorized"))
		return
	}

	orders, err := h.service.GetOrdersByUserID(c.Request.Context(), userID)
	if err != nil {
		if err == domain.ErrOrderNotFound {
			c.JSON(http.StatusNotFound, pkg.ErrorResponse(domain.ErrCodeOrderNotFound, "no orders found for user"))
			return
		}
		if err == domain.ErrProductNotFound {
			c.JSON(http.StatusNotFound, pkg.ErrorResponse(domain.ErrCodeProductNotFound, "no orders found for user"))
			return
		}
		c.JSON(http.StatusInternalServerError, pkg.ErrorResponse(domain.ErrCodeInternal, "failed to retrieve orders"))
		return
	}

	c.JSON(http.StatusOK, pkg.SuccessResponse(orders))
}

func (h *OrderHandler) GetOrderByID(c *gin.Context) {
	// Implement logic to retrieve order details by order ID
	orderID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, pkg.ErrorResponse(domain.ErrCodeInvalidRequest, "invalid order ID"))
		return
	}

	order, err := h.service.GetOrderByID(c.Request.Context(), orderID)
	if err != nil {
		if err == domain.ErrOrderNotFound {
			c.JSON(http.StatusNotFound, pkg.ErrorResponse(domain.ErrCodeOrderNotFound, "order not found"))
			return
		}
		if err == domain.ErrProductNotFound {
			c.JSON(http.StatusNotFound, pkg.ErrorResponse(domain.ErrCodeProductNotFound, "product not found"))
			return
		}
		c.JSON(http.StatusInternalServerError, pkg.ErrorResponse(domain.ErrCodeInternal, "failed to retrieve order details"))
		return
	}

	c.JSON(http.StatusOK, pkg.SuccessResponse(order))
}
