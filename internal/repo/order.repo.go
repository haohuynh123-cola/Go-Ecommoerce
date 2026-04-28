package repo

import (
	"context"
	"database/sql"
	"haohuynh123-cola/ecommce/internal/domain"

	"github.com/jmoiron/sqlx"
)

type OrderRepository struct {
	db *sqlx.DB
}

func NewOrderRepository(db *sqlx.DB) domain.OrderRepository {
	return &OrderRepository{
		db: db,
	}
}

func (r *OrderRepository) CreateOrder(ctx context.Context, order *domain.Order) (*domain.Order, error) {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	query := `INSERT INTO orders (user_id, order_date, total_amount) VALUES (?, ?, ?)`
	result, err := tx.ExecContext(ctx, query, order.UserID, order.OrderDate, order.TotalAmount)
	if err != nil {
		return nil, err
	}

	orderID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	order.ID = orderID

	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return order, nil
}

func (r *OrderRepository) GetOrdersByUserID(ctx context.Context, userID int64) ([]*domain.Order, error) {
	query := `SELECT id, user_id, order_date, total_amount, status FROM orders WHERE user_id = ?`
	rows, err := r.db.QueryxContext(ctx, query, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrOrderNotFound
		}
		return nil, err
	}
	defer rows.Close()

	var orders []*domain.Order

	for rows.Next() {
		var order domain.Order
		if err := rows.StructScan(&order); err != nil {
			return nil, err
		}
		orders = append(orders, &order)
	}

	//params include:order_items
	orderIDs := make([]int64, 0, len(orders))
	for _, o := range orders {
		orderIDs = append(orderIDs, o.ID)
	}

	itemQuery, args, err := sqlx.In(
		`SELECT order_id, product_id, quantity, price FROM order_items WHERE order_id IN (?)`,
		orderIDs,
	)
	if err != nil {
		return nil, err
	}
	itemQuery = r.db.Rebind(itemQuery)

	itemRows, err := r.db.QueryxContext(ctx, itemQuery, args...)
	if err != nil {
		return nil, err
	}
	defer itemRows.Close()

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return orders, nil
}

func (r *OrderRepository) GetOrderByID(ctx context.Context, orderID int64) (*domain.Order, error) {
	query := `SELECT id, user_id, order_date, total_amount, status FROM orders WHERE id = ?`
	var order domain.Order
	if err := r.db.GetContext(ctx, &order, query, orderID); err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrOrderNotFound
		}

		return nil, err
	}

	return &order, nil
}
