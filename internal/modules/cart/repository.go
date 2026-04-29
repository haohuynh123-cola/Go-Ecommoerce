package cart

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"haohuynh123-cola/ecommce/internal/modules/product"
	"haohuynh123-cola/ecommce/internal/shared/errs"

	"github.com/jmoiron/sqlx"
)

type CartRepositoryImpl struct {
	DB *sqlx.DB
}

func NewCartRepository(db *sqlx.DB) CartRepository {
	return &CartRepositoryImpl{
		DB: db,
	}
}

func (r *CartRepositoryImpl) AddToCart(ctx context.Context, cart *Cart) error {
	query := `INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)
			  ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`
	_, err := r.DB.ExecContext(ctx, query, cart.UserID, cart.ProductID, cart.Quantity)
	return err
}

func (r *CartRepositoryImpl) GetCartItems(ctx context.Context, userID int64) ([]*Cart, error) {
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

	var carts []*Cart
	for rows.Next() {
		c := &Cart{Product: &product.Product{}}
		if err := rows.Scan(
			&c.ID, &c.UserID, &c.ProductID, &c.Quantity,
			&c.Product.ID, &c.Product.Name, &c.Product.Description,
			&c.Product.SKU, &c.Product.Price, &c.Product.Stock,
		); err != nil {
			return nil, err
		}
		carts = append(carts, c)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return carts, nil
}

func (r *CartRepositoryImpl) RemoveFromCart(ctx context.Context, userID, productID int64) error {
	query := `DELETE FROM carts WHERE user_id = ? AND product_id = ?`
	_, err := r.DB.ExecContext(ctx, query, userID, productID)

	if err != nil {
		fmt.Printf("Error removing item from cart: %v\n", err)
		return err
	}

	return nil
}

func (r *CartRepositoryImpl) UpdateCartItem(ctx context.Context, cart *Cart) error {
	query := `UPDATE carts SET quantity = ? WHERE user_id = ? AND product_id = ?`
	_, err := r.DB.ExecContext(ctx, query, cart.Quantity, cart.UserID, cart.ProductID)
	return err
}

func (r *CartRepositoryImpl) ClearCart(ctx context.Context, userID int64) error {
	query := `DELETE FROM carts WHERE user_id = ?`
	_, err := r.DB.ExecContext(ctx, query, userID)
	return err
}

func (r *CartRepositoryImpl) GetProductInCart(ctx context.Context, userID, productID int64) (*Cart, error) {

	query := `SELECT id, user_id, product_id, quantity FROM carts WHERE user_id = ? AND product_id = ?`
	row := r.DB.QueryRowContext(ctx, query, userID, productID)

	c := &Cart{}

	if err := row.Scan(&c.ID, &c.UserID, &c.ProductID, &c.Quantity); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errs.ErrCartItemNotFound
		}
		return nil, fmt.Errorf("get cart item: %w", err)
	}

	return c, nil
}
