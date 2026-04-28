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

func loadProductsInOrder(ctx context.Context, db *sqlx.DB, items []domain.OrderItem) (map[int64]*domain.Product, error) {
	productIDs := make([]int64, 0, len(items))
	for _, item := range items {
		productIDs = append(productIDs, item.ProductID)
	}

	productQuery, args, err := sqlx.In(
		`SELECT id, name, description, sku, price, stock FROM products WHERE id IN (?)`,
		productIDs,
	)
	if err != nil {
		return nil, err
	}
	productQuery = db.Rebind(productQuery)

	var products []domain.Product
	if err := db.SelectContext(ctx, &products, productQuery, args...); err != nil {
		return nil, err
	}

	productMap := make(map[int64]*domain.Product)
	for i := range products {
		productMap[products[i].ID] = &products[i]
	}
	return productMap, nil
}

func loadOrderActivities(ctx context.Context, db *sqlx.DB, orderID int64) ([]*domain.OrderActivity, error) {
	query := `SELECT order_id, description, activity_type, activity_at FROM order_activities WHERE order_id = ? ORDER BY activity_at DESC`
	rows, err := db.QueryxContext(ctx, query, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var activities []*domain.OrderActivity
	for rows.Next() {
		var activity domain.OrderActivity
		if err := rows.StructScan(&activity); err != nil {
			return nil, err
		}
		activities = append(activities, &activity)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return activities, nil
}
