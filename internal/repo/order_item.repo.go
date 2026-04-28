package repo

import (
	"context"
	"haohuynh123-cola/ecommce/internal/domain"

	"github.com/jmoiron/sqlx"
)

type OrderItemRepository struct {
	db *sqlx.DB
}

func NewOrderItemRepository(db *sqlx.DB) domain.OrderItemRepository {
	return &OrderItemRepository{
		db: db,
	}
}

func (r *OrderItemRepository) GetOrderItemsByOrderID(ctx context.Context, orderID int64) ([]*domain.OrderItem, error) {
	query := `SELECT id, order_id, product_id, quantity, price FROM order_items WHERE order_id = ?`
	var items []*domain.OrderItem
	err := r.db.SelectContext(ctx, &items, query, orderID)
	if err != nil {
		return nil, err
	}
	return items, nil
}

func (r *OrderItemRepository) CreateOrderItems(ctx context.Context, items []*domain.OrderItem) error {
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
