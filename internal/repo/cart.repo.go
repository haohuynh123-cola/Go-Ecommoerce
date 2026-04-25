package repo

import (
	"context"
	"haohuynh123-cola/ecommce/internal/domain"

	"github.com/jmoiron/sqlx"
)

type CartRepository struct {
	DB *sqlx.DB
}

func NewCartRepository(db *sqlx.DB) domain.CartRepository {
	return &CartRepository{
		DB: db,
	}
}

func (r *CartRepository) AddToCart(ctx context.Context, cart *domain.Cart) error {
	query := `INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)
			  ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`
	_, err := r.DB.ExecContext(ctx, query, cart.UserID, cart.ProductID, cart.Quantity)
	return err
}

func (r *CartRepository) GetCartItems(ctx context.Context, userID int64) ([]*domain.Cart, error) {
	query := `SELECT c.id, c.user_id, c.product_id, c.quantity, p.id, p.name, p.description, p.sku, p.price, p.stock
				FROM carts c
				JOIN products p  ON c.product_id = p.id
				WHERE c.user_id = ?
			`
	rows, err := r.DB.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var carts []*domain.Cart
	for rows.Next() {
		cart := &domain.Cart{Product: &domain.Product{}}
		if err := rows.Scan(
			&cart.ID, &cart.UserID, &cart.ProductID, &cart.Quantity,
			&cart.Product.ID, &cart.Product.Name, &cart.Product.Description,
			&cart.Product.SKU, &cart.Product.Price, &cart.Product.Stock,
		); err != nil {
			return nil, err
		}
		carts = append(carts, cart)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return carts, nil
}

func (r *CartRepository) RemoveFromCart(ctx context.Context, userID int64, productID int64) error {
	query := `DELETE FROM carts WHERE user_id = ? AND product_id = ?`
	_, err := r.DB.ExecContext(ctx, query, userID, productID)
	return err
}

func (r *CartRepository) UpdateCartItem(ctx context.Context, cart *domain.Cart) error {
	query := `UPDATE carts SET quantity = ? WHERE user_id = ? AND product_id = ?`
	_, err := r.DB.ExecContext(ctx, query, cart.Quantity, cart.UserID, cart.ProductID)
	return err
}

func (r *CartRepository) ClearCart(ctx context.Context, userID int64) error {
	query := `DELETE FROM carts WHERE user_id = ?`
	_, err := r.DB.ExecContext(ctx, query, userID)
	return err
}
