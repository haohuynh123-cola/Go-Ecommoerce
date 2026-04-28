package domain

import (
	"context"
	"haohuynh123-cola/ecommce/internal/dto"
	"time"
)

type Order struct {
	ID          int64     `json:"id,omitempty" db:"id"`
	UserID      int64     `json:"user_id" db:"user_id"`
	OrderDate   time.Time `json:"order_date" db:"order_date"`
	TotalAmount float64   `json:"total_amount" db:"total_amount"`
	Status      string    `json:"status" db:"status"`
}

type OrderRepository interface {
	CreateOrder(ctx context.Context, order *Order) (*Order, error)
	GetOrdersByUserID(ctx context.Context, userID int64) ([]*Order, error)
	GetOrderByID(ctx context.Context, orderID int64) (*Order, error)
}

type OrderService interface {
	CreateOrder(ctx context.Context, req *dto.CreateOrderRequest) (*dto.CreateOrderResponse, error)
	GetOrdersByUserID(ctx context.Context, userID int64) ([]*dto.OrderResponse, error)
	GetOrderByID(ctx context.Context, orderID int64) (*dto.GetOrderByIDResponse, error)
	GetActivitiesByOrderID(ctx context.Context, orderID int64) ([]*dto.OrderActivityResponse, error)
}
