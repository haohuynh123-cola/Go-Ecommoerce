package order

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"time"

	orderdto "haohuynh123-cola/ecommce/internal/modules/order/dto"
	"haohuynh123-cola/ecommce/internal/platform/config"
	"haohuynh123-cola/ecommce/internal/shared/errs"
	"haohuynh123-cola/ecommce/internal/shared/middleware"
	"haohuynh123-cola/ecommce/internal/shared/response"

	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	service OrderService
	cfg     config.JWTConfig
}

func NewOrderHandler(service OrderService, cfg config.JWTConfig) *OrderHandler {
	return &OrderHandler{
		service: service,
		cfg:     cfg,
	}
}

func (h *OrderHandler) RegisterRoutes(r *gin.Engine) {
	orderGroup := r.Group("/api/v1/orders")
	orderGroup.Use(middleware.AuthMiddleware(&h.cfg)) // Apply authentication middleware to order routes
	orderGroup.POST("/", h.CreateOrder)
	orderGroup.GET("/", h.GetOrdersByUserID)
	orderGroup.GET("/:id", h.GetOrderByID)
	orderGroup.PATCH("/:id/status", h.UpdateOrderStatus)
	orderGroup.GET("/:id/activities", h.GetOrderActivities)
}

// CreateOrder handles the creation of a new order
// @Summary Create a new order
// @Description Create a new order for the authenticated user
// @Tags Orders
// @Accept json
// @Produce json
// @Param order body orderdto.CreateOrderRequest true "Order details"
// @security     BearerAuth
// @Success 200 {object} response.SuccessResponseSwag{data=orderdto.GetOrdersResponse}
// @Failure 400 {object} response.ErrorResponseSwag
// @Failure 401 {object} response.ErrorResponseSwag
// @Failure 500 {object} response.ErrorResponseSwag
// @Router /orders [post]
func (h *OrderHandler) CreateOrder(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()

	// Implement logic to create a new order
	userID := c.GetInt64("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse(errs.ErrCodeUnauthorized, "unauthorized"))
		return
	}

	var req orderdto.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse(errs.ErrCodeInvalidRequest, err.Error()))
		return
	}

	req.UserID = userID

	o, err := h.service.CreateOrder(ctx, &req)
	if err != nil {
		if errors.Is(err, errs.ErrProductNotFound) {
			c.JSON(http.StatusNotFound, response.ErrorResponse(errs.ErrCodeProductNotFound, "product not found"))
			return
		}
		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, "failed to create order"))
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse(o))
}

// GetOrdersByUserID handles retrieving orders for the authenticated user
// @Summary Get orders for authenticated user
// @Description Retrieve all orders for the authenticated user
// @Tags Orders
// @Accept json
// @Produce json
// @security     BearerAuth
// @Success 200 {object} response.SuccessResponseSwag{data=orderdto.OrderResponse}
// @Failure 401 {object} response.ErrorResponseSwag
// @Failure 404 {object} response.ErrorResponseSwag
// @Failure 500 {object} response.ErrorResponseSwag
// @Router /orders [get]
func (h *OrderHandler) GetOrdersByUserID(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()
	// Implement logic to retrieve orders by user ID
	userID := c.GetInt64("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse(errs.ErrCodeUnauthorized, "unauthorized"))
		return
	}

	orders, err := h.service.GetOrdersByUserID(ctx, userID)
	if err != nil {
		if err == errs.ErrOrderNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse(errs.ErrCodeOrderNotFound, "no orders found for user"))
			return
		}
		if err == errs.ErrProductNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse(errs.ErrCodeProductNotFound, "no orders found for user"))
			return
		}
		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, "failed to retrieve orders"))
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse(orders))
}

// GetOrderByID handles retrieving order details by order ID
// @Summary Get order details by order ID
// @Description Retrieve order details for the specified order ID
// @Tags Orders
// @Accept json
// @Produce json
// @Param id path int true "Order ID"
// @security     BearerAuth
// @Success 200 {object} response.SuccessResponseSwag{data=orderdto.OrderResponse}
// @Failure 400 {object} response.ErrorResponseSwag
// @Failure 401 {object} response.ErrorResponseSwag
// @Failure 404 {object} response.ErrorResponseSwag
// @Failure 500 {object} response.ErrorResponseSwag
// @Router /orders/{id} [get]
func (h *OrderHandler) GetOrderByID(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()
	// Implement logic to retrieve order details by order ID
	orderID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse(errs.ErrCodeInvalidRequest, "invalid order ID"))
		return
	}

	o, err := h.service.GetOrderByID(ctx, orderID)
	if err != nil {
		if err == errs.ErrOrderNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse(errs.ErrCodeOrderNotFound, "order not found"))
			return
		}
		if err == errs.ErrProductNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse(errs.ErrCodeProductNotFound, "product not found"))
			return
		}
		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, "failed to retrieve order details"))
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse(o))
}

// UpdateOrderStatus handles updating the status of an existing order
// @Summary Update order status
// @Description Update the status of an order. Valid values: Created, Confirmed, Shipping, Delivered, Cancelled
// @Tags Orders
// @Accept json
// @Produce json
// @Param id path int true "Order ID"
// @Param status body orderdto.UpdateOrderStatusRequest true "New status"
// @security     BearerAuth
// @Success 200 {object} response.SuccessResponseSwag{data=orderdto.GetOrderByIDResponse}
// @Failure 400 {object} response.ErrorResponseSwag
// @Failure 401 {object} response.ErrorResponseSwag
// @Failure 404 {object} response.ErrorResponseSwag
// @Failure 500 {object} response.ErrorResponseSwag
// @Router /orders/{id}/status [patch]
func (h *OrderHandler) UpdateOrderStatus(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()
	orderID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse(errs.ErrCodeInvalidRequest, "invalid order ID"))
		return
	}

	var req orderdto.UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse(errs.ErrCodeInvalidRequest, err.Error()))
		return
	}

	o, err := h.service.UpdateOrderStatus(ctx, orderID, req.Status)
	if err != nil {
		if errors.Is(err, errs.ErrInvalidOrderStatus) {
			c.JSON(http.StatusBadRequest, response.ErrorResponse(errs.ErrCodeInvalidRequest, "status must be one of: Created, Confirmed, Shipping, Delivered, Cancelled"))
			return
		}
		if errors.Is(err, errs.ErrOrderNotFound) {
			c.JSON(http.StatusNotFound, response.ErrorResponse(errs.ErrCodeOrderNotFound, "order not found"))
			return
		}
		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, "failed to update order status"))
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse(o))
}

// GetOrderActivities handles retrieving activity history for an order
// @Summary Get order activities
// @Description Retrieve all activity records for the specified order
// @Tags Orders
// @Accept json
// @Produce json
// @Param id path int true "Order ID"
// @security     BearerAuth
// @Success 200 {object} response.SuccessResponseSwag{data=[]orderdto.OrderActivityResponse}
// @Failure 400 {object} response.ErrorResponseSwag
// @Failure 401 {object} response.ErrorResponseSwag
// @Failure 404 {object} response.ErrorResponseSwag
// @Failure 500 {object} response.ErrorResponseSwag
// @Router /orders/{id}/activities [get]
func (h *OrderHandler) GetOrderActivities(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()

	orderID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse(errs.ErrCodeInvalidRequest, "invalid order ID"))
		return
	}

	activities, err := h.service.GetActivitiesByOrderID(ctx, orderID)
	if err != nil {
		if errors.Is(err, errs.ErrOrderNotFound) {
			c.JSON(http.StatusNotFound, response.ErrorResponse(errs.ErrCodeOrderNotFound, "order not found"))
			return
		}
		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, "failed to retrieve order activities"))
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse(activities))
}
