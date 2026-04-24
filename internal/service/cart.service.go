package service

import (
	"context"
	"haohuynh123-cola/ecommce/internal/domain"
	"haohuynh123-cola/ecommce/internal/dto"
	"haohuynh123-cola/ecommce/internal/repo"
)

type CartService struct {
	// You can add dependencies here, such as repositories
	repo repo.CartRepository
}

// NewCartService creates a new instance of CartService
func NewCartService(repo repo.CartRepository) domain.CartService {
	return &CartService{
		repo: repo,
	}
}

func (s *CartService) AddToCart(ctx context.Context, cart *dto.AddToCartRequest) error {
	// Implement logic to add item to cart
	//format the request to domain.Cart
	cartItem := &domain.Cart{
		UserID:    cart.UserID,
		ProductID: cart.ProductID,
		Quantity:  cart.Quantity,
	}

	return s.repo.AddToCart(ctx, cartItem)
}

func (s *CartService) GetCartItems(ctx context.Context, userID int64) ([]*domain.CartItem, error) {
	// Implement logic to get cart items for a user
	return s.repo.GetCartItems(ctx, userID)
}

func (s *CartService) RemoveFromCart(ctx context.Context, userID int64, productID int64) error {
	// Implement logic to remove item from cart
	return s.repo.RemoveFromCart(ctx, userID, productID)
}

func (s *CartService) UpdateCartItem(ctx context.Context, cart *dto.UpdateCartItemRequest) error {
	// Implement logic to update cart item quantity
	cartItem := &domain.Cart{
		UserID:    cart.UserID,
		ProductID: cart.ProductID,
		Quantity:  cart.Quantity,
	}
	return s.repo.UpdateCartItem(ctx, cartItem)
}

func (s *CartService) ClearCart(ctx context.Context, userID int64) error {
	// Implement logic to clear cart for a user
	return s.repo.ClearCart(ctx, userID)
}
