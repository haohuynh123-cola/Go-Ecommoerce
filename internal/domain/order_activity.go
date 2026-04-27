package domain

import (
	"context"
	"time"
)

type OrderActivity struct {
	OrderID      int64     `json:"order_id" db:"order_id"`
	Description  string    `json:"description" db:"description"`
	ActivityType string    `json:"activity_type" db:"activity_type"`
	ActivityAt   time.Time `json:"activity_at" db:"activity_at"`
}

type OrderActivityRepository interface {
	GetOrderActivitiesByOrderID(ctx context.Context, orderID int64) ([]*OrderActivity, error)
	CreateOrderActivity(ctx context.Context, activity *OrderActivity) error
}
