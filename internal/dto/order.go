package dto

import "time"

type CreateOrderRequest struct {
	UserID int64             `json:"user_id" `
	Items  []CreateOrderItem `json:"items" binding:"required,dive"`
}

type CreateOrderItem struct {
	ProductID int64    `json:"product_id" binding:"required"`
	Quantity  int      `json:"quantity" binding:"required,gt=0"`
	Price     float64  `json:"price" binding:"omitempty"` //price get in service layer, not required in request body
	Product   *Product `json:"product,omitempty"`         // product name, get in service layer, not required in request body
}

// Response struct for create order
type CreateOrderResponse struct {
	ID          int64             `json:"id"`
	UserID      int64             `json:"user_id"`
	OrderDate   time.Time         `json:"order_date,omitempty"`
	TotalAmount float64           `json:"total_amount"`
	Items       []CreateOrderItem `json:"items"`
}

type GetOrdersResponse struct {
	Orders []CreateOrderResponse `json:"orders"`
}

type OrderActivityResponse struct {
	OrderID      int64  `json:"order_id"`
	ActivityType string `json:"activity_type"`
	Description  string `json:"description"`
	ActivityAt   string `json:"activity_at"`
}

type GetOrderByIDResponse struct {
	ID          int64                    `json:"id"`
	UserID      int64                    `json:"user_id"`
	OrderDate   time.Time                `json:"order_date,omitempty" default:"now()"`
	TotalAmount float64                  `json:"total_amount"`
	Items       []OrderItemResponse      `json:"items"`
	Activities  []*OrderActivityResponse `json:"activities,omitempty"`
}

type OrderItemResponse struct {
	ProductID int64    `json:"product_id" binding:"required"`
	Quantity  int      `json:"quantity" binding:"required,gt=0"`
	Price     float64  `json:"price" binding:"omitempty"` //price get in service layer, not required in request body
	Product   *Product `json:"product,omitempty"`         // product name, get in service layer, not required in request body
}
