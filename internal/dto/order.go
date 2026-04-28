package dto

import "time"

// Order Request Create
type CreateOrderRequest struct {
	UserID int64             `json:"-"` //user_id get from token, not required in request body
	Items  []CreateOrderItem `json:"items" binding:"required,dive"`
}

// Response struct for create order
type CreateOrderResponse struct {
	ID          int64             `json:"id"`
	UserID      int64             `json:"user_id"`
	OrderDate   time.Time         `json:"order_date,omitempty"`
	TotalAmount float64           `json:"total_amount"`
	Items       []CreateOrderItem `json:"items"`
}

// Response struct for Order
type OrderResponse struct {
	ID          int64               `json:"id"`
	UserID      int64               `json:"user_id"`
	OrderDate   time.Time           `json:"order_date,omitempty"`
	TotalAmount float64             `json:"total_amount"`
	Status      string              `json:"status"`
	Items       []OrderItemResponse `json:"items"`
}

type GetOrdersResponse struct {
	Orders []OrderResponse `json:"orders"`
}

type GetOrderByIDResponse struct {
	ID          int64                   `json:"id"`
	UserID      int64                   `json:"user_id"`
	OrderDate   time.Time               `json:"order_date,omitempty"`
	TotalAmount float64                 `json:"total_amount"`
	Status      string                  `json:"status"`
	Items       []OrderItemResponse     `json:"items"`
	Activities  []OrderActivityResponse `json:"activities,omitempty"`
}

// UpdateOrderStatusRequest is the request body for PATCH /orders/:id/status.
type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required"`
}
