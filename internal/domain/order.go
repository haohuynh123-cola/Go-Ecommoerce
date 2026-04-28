package domain

import (
	"context"
	"haohuynh123-cola/ecommce/internal/dto"
	"time"
)

const (
	OrderStatusCreated   = "Created"
	OrderStatusConfirmed = "Confirmed"
	OrderStatusShipping  = "Shipping"
	OrderStatusDelivered = "Delivered"
	OrderStatusCancelled = "Cancelled"
)

var validOrderStatuses = map[string]struct{}{
	OrderStatusCreated:   {},
	OrderStatusConfirmed: {},
	OrderStatusShipping:  {},
	OrderStatusDelivered: {},
	OrderStatusCancelled: {},
}

// IsValidOrderStatus reports whether s is a recognised order status value.
func IsValidOrderStatus(s string) bool {
	_, ok := validOrderStatuses[s]
	return ok
}

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
	// UpdateOrderStatusWithActivity updates the order's status and inserts a
	// matching activity record atomically inside a single transaction.
	UpdateOrderStatusWithActivity(ctx context.Context, orderID int64, newStatus string, activity *OrderActivity) error
}

type OrderService interface {
	CreateOrder(ctx context.Context, req *dto.CreateOrderRequest) (*dto.CreateOrderResponse, error)
	GetOrdersByUserID(ctx context.Context, userID int64) ([]*dto.OrderResponse, error)
	GetOrderByID(ctx context.Context, orderID int64) (*dto.GetOrderByIDResponse, error)
	GetActivitiesByOrderID(ctx context.Context, orderID int64) ([]*dto.OrderActivityResponse, error)
	UpdateOrderStatus(ctx context.Context, orderID int64, newStatus string) (*dto.GetOrderByIDResponse, error)
}
