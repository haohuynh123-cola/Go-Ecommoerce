package order

import (
	"context"

	"github.com/jmoiron/sqlx"
)

type OrderItemRepositoryImpl struct {
	db *sqlx.DB
}

func NewOrderItemRepository(db *sqlx.DB) OrderItemRepository {
	return &OrderItemRepositoryImpl{
		db: db,
	}
}

func (r *OrderItemRepositoryImpl) GetOrderItemsByOrderID(ctx context.Context, orderID int64) ([]*OrderItem, error) {
	query := `SELECT id, order_id, product_id, quantity, price FROM order_items WHERE order_id = ?`
	var items []*OrderItem
	err := r.db.SelectContext(ctx, &items, query, orderID)
	if err != nil {
		return nil, err
	}
	return items, nil
}

func (r *OrderItemRepositoryImpl) CreateOrderItems(ctx context.Context, items []*OrderItem) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`
	for _, item := range items {
		_, err := tx.ExecContext(ctx, query, item.OrderID, item.ProductID, item.Quantity, item.Price)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}
