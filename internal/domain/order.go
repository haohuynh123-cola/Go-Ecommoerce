package domain

import (
	"context"
	"haohuynh123-cola/ecommce/internal/dto"
	"time"
)

type Order struct {
	ID          int64       `json:"id,omitempty" db:"id"`
	UserID      int64       `json:"user_id" db:"user_id"`
	OrderDate   time.Time   `json:"order_date" db:"order_date"`
	TotalAmount float64     `json:"total_amount" db:"total_amount"`
	Status      string      `json:"status" db:"status"`
	Items       []OrderItem `json:"items" db:"-"`
}

type OrderItem struct {
	ID        int64    `json:"id" db:"id"`
	OrderID   int64    `json:"order_id" db:"order_id"`
	ProductID int64    `json:"product_id" db:"product_id"`
	Quantity  int      `json:"quantity" db:"quantity"`
	Price     float64  `json:"price" db:"price"`
	Product   *Product `json:"product,omitempty" db:"-"`
}

type OrderRepository interface {
	CreateOrder(ctx context.Context, order *Order) (*Order, error)
	GetOrdersByUserID(ctx context.Context, userID int64) ([]*Order, error)
	GetOrderByID(ctx context.Context, orderID int64) (*Order, error)
}

type OrderService interface {
	CreateOrder(ctx context.Context, req *dto.CreateOrderRequest) (*dto.CreateOrderResponse, error)
	GetOrdersByUserID(ctx context.Context, userID int64) ([]*dto.CreateOrderResponse, error)
	GetOrderByID(ctx context.Context, orderID int64) (*dto.CreateOrderResponse, error)
}
