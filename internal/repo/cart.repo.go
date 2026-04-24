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

func (r *CartRepository) GetCartItems(ctx context.Context, userID int64) ([]*domain.CartItem, error) {
	query := `SELECT id, user_id, product_id, quantity, created_at, updated_at FROM carts WHERE user_id = ?`
	rows, err := r.DB.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cartItems []*domain.CartItem
	for rows.Next() {
		var cart domain.Cart
		i := rows.Scan(&cart.ID, &cart.UserID, &cart.ProductID, &cart.Quantity)
		if i != nil {
			return nil, i
		}
		cartItems = append(cartItems, &domain.CartItem{
			Product:  &domain.Product{ID: cart.ProductID},
			Quantity: cart.Quantity,
		})
	}
	return cartItems, nil
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
