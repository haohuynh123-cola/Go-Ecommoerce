package domain

import (
	"context"
	"haohuynh123-cola/ecommce/internal/dto"
)

type Cart struct {
	ID        int64    `db:"id" json:"id"`
	UserID    int64    `db:"user_id" json:"user_id"`
	ProductID int64    `db:"product_id" json:"product_id"`
	Quantity  int      `db:"quantity" json:"quantity"`
	Product   *Product `json:"product,omitempty"`
}

type CartItem struct {
	Product  *Product `json:"product"`
	Quantity int      `json:"quantity"`
}

type CartService interface {
	AddToCart(ctx context.Context, cart *dto.AddToCartRequest) error
	GetCartItems(ctx context.Context, userID int64) ([]*CartItem, error)
	UpdateCartItem(ctx context.Context, cart *dto.UpdateCartItemRequest) error
	RemoveFromCart(ctx context.Context, cart *dto.RemoveFromCartRequest) error
	ClearCart(ctx context.Context, userID int64) error
}

type CartRepository interface {
	AddToCart(ctx context.Context, cart *Cart) error
	GetCartItems(ctx context.Context, userID int64) ([]*Cart, error)
	UpdateCartItem(ctx context.Context, cart *Cart) error
	RemoveFromCart(ctx context.Context, userID, productID int64) error
	ClearCart(ctx context.Context, userID int64) error
	GetProductInCart(ctx context.Context, userID, productID int64) (*Cart, error)
}
