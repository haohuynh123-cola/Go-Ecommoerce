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
	query := `INSERT INTO orders (user_id, order_date, total_amount) VALUES (?, ?, ?)`
	result, err := r.db.ExecContext(ctx, query, order.UserID, order.OrderDate, order.TotalAmount)
	if err != nil {
		return nil, err
	}

	orderID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	order.ID = orderID

	// Insert order items
	for _, item := range order.Items {
		item.OrderID = orderID
		itemQuery := `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`
		_, err := r.db.ExecContext(ctx, itemQuery, item.OrderID, item.ProductID, item.Quantity, item.Price)
		if err != nil {
			return nil, err
		}
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
	orderMap := make(map[int64]*domain.Order) // để map items về đúng order

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
	itemQuery = r.db.Rebind(itemQuery) // chuẩn hóa placeholder cho từng driver

	itemRows, err := r.db.QueryxContext(ctx, itemQuery, args...)
	if err != nil {
		return nil, err
	}
	defer itemRows.Close()

	for itemRows.Next() {
		var item domain.OrderItem
		if err := itemRows.StructScan(&item); err != nil {
			return nil, err
		}
		// Gắn item vào đúng order qua map — O(1)
		if order, ok := orderMap[item.OrderID]; ok {
			order.Items = append(order.Items, item)
		}
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

	items, err := loadOrderItems(ctx, r.db, orderID)
	if err != nil {
		return nil, err
	}
	order.Items = items

	return &order, nil
}

func loadOrderItems(ctx context.Context, db *sqlx.DB, orderID int64) ([]domain.OrderItem, error) {
	itemQuery := `SELECT id, order_id, product_id, quantity, price FROM order_items WHERE order_id = ?`
	var items []domain.OrderItem
	if err := db.SelectContext(ctx, &items, itemQuery, orderID); err != nil {
		return nil, err
	}

	// Load product details for items
	productMap, err := loadProductsInOrder(ctx, db, items)
	if err != nil {
		return nil, err
	}

	for i := range items {
		if product, ok := productMap[items[i].ProductID]; ok {
			items[i].Product = product
		}
	}

	return items, nil

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
