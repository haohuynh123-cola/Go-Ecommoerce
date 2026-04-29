package order

import (
	"context"
	"time"

	orderdto "haohuynh123-cola/ecommce/internal/modules/order/dto"
	"haohuynh123-cola/ecommce/internal/modules/product"
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

type OrderItem struct {
	ID        int64            `json:"id" db:"id"`
	OrderID   int64            `json:"order_id" db:"order_id"`
	ProductID int64            `json:"product_id" db:"product_id"`
	Quantity  int              `json:"quantity" db:"quantity"`
	Price     float64          `json:"price" db:"price"`
	Product   *product.Product `json:"product,omitempty" db:"-"`
}

type OrderActivity struct {
	ID           int64     `json:"id" db:"id"`
	OrderID      int64     `json:"order_id" db:"order_id"`
	Description  string    `json:"description" db:"description"`
	ActivityType string    `json:"activity_type" db:"activity_type"`
	ActivityAt   time.Time `json:"activity_at" db:"activity_at"`
}

type OrderRepository interface {
	CreateOrder(ctx context.Context, order *Order) (*Order, error)
	GetOrdersByUserID(ctx context.Context, userID int64) ([]*Order, error)
	GetOrderByID(ctx context.Context, orderID int64) (*Order, error)
	// UpdateOrderStatusWithActivity updates the order's status and inserts a
	// matching activity record atomically inside a single transaction.
	UpdateOrderStatusWithActivity(ctx context.Context, orderID int64, newStatus string, activity *OrderActivity) error
}

type OrderItemRepository interface {
	GetOrderItemsByOrderID(ctx context.Context, orderID int64) ([]*OrderItem, error)
	CreateOrderItems(ctx context.Context, items []*OrderItem) error
}

type OrderActivityRepository interface {
	GetOrderActivitiesByOrderID(ctx context.Context, orderID int64) ([]*OrderActivity, error)
	CreateOrderActivity(ctx context.Context, activity *OrderActivity) error
}

type OrderService interface {
	CreateOrder(ctx context.Context, req *orderdto.CreateOrderRequest) (*orderdto.CreateOrderResponse, error)
	GetOrdersByUserID(ctx context.Context, userID int64) ([]*orderdto.OrderResponse, error)
	GetOrderByID(ctx context.Context, orderID int64) (*orderdto.GetOrderByIDResponse, error)
	GetActivitiesByOrderID(ctx context.Context, orderID int64) ([]*orderdto.OrderActivityResponse, error)
	UpdateOrderStatus(ctx context.Context, orderID int64, newStatus string) (*orderdto.GetOrderByIDResponse, error)
}
