package domain

import "context"

type OrderItem struct {
	ID        int64    `json:"id" db:"id"`
	OrderID   int64    `json:"order_id" db:"order_id"`
	ProductID int64    `json:"product_id" db:"product_id"`
	Quantity  int      `json:"quantity" db:"quantity"`
	Price     float64  `json:"price" db:"price"`
	Product   *Product `json:"product,omitempty" db:"-"`
}

type OrderItemRepository interface {
	GetOrderItemsByOrderID(ctx context.Context, orderID int64) ([]*OrderItem, error)
	CreateOrderItems(ctx context.Context, items []*OrderItem) error
}
