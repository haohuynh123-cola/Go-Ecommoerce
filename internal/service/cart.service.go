package service

import (
	"context"
	"fmt"
	"haohuynh123-cola/ecommce/internal/cache"
	"haohuynh123-cola/ecommce/internal/domain"
	"haohuynh123-cola/ecommce/internal/dto"
)

type CartService struct {
	// You can add dependencies here, such as repositories
	repo domain.CartRepository
	rdb  *cache.CartCache
}

// NewCartService creates a new instance of CartService
func NewCartService(repo domain.CartRepository, rdb *cache.CartCache) domain.CartService {
	return &CartService{
		repo: repo,
		rdb:  rdb,
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

func keyCache(userID int64) string {
	return fmt.Sprintf("cart:user:%d", userID)
}

func (s *CartService) GetCartItems(ctx context.Context, userID int64) ([]*domain.CartItem, error) {
	//Get from cache first
	key := keyCache(userID)
	if items, hit, _ := s.rdb.GetCartItems(ctx, key); hit {
		return items, nil
	}
	// Implement logic to get cart items for a user
	carts, err := s.repo.GetCartItems(ctx, userID)
	if err != nil {
		return nil, err
	}
	items := toCartItems(carts)
	// Set the items in cache
	_ = s.rdb.SetCartItems(ctx, key, items)

	return items, nil
}

func (s *CartService) RemoveFromCart(ctx context.Context, userID int64, productID int64) error {
	// Implement logic to remove item from cart
	key := keyCache(userID)
	// Clear the cache for the user
	_ = s.rdb.ClearCart(ctx, key)

	return s.repo.RemoveFromCart(ctx, userID, productID)
}

func (s *CartService) UpdateCartItem(ctx context.Context, cart *dto.UpdateCartItemRequest) error {
	// Implement logic to update cart item quantity
	cartItem := &domain.Cart{
		UserID:    cart.UserID,
		ProductID: cart.ProductID,
		Quantity:  cart.Quantity,
	}
	key := keyCache(cart.UserID)
	// Clear the cache for the user
	items := toCartItems([]*domain.Cart{cartItem})
	_ = s.rdb.SetCartItems(ctx, key, items)

	return s.repo.UpdateCartItem(ctx, cartItem)
}

func (s *CartService) ClearCart(ctx context.Context, userID int64) error {
	// Implement logic to clear cart for a user
	key := keyCache(userID)
	// Clear the cache for the user
	_ = s.rdb.ClearCart(ctx, key)

	return s.repo.ClearCart(ctx, userID)
}

func toCartItems(carts []*domain.Cart) []*domain.CartItem {
	items := make([]*domain.CartItem, 0, len(carts))
	for _, c := range carts {
		items = append(items, &domain.CartItem{
			Product:  c.Product,
			Quantity: c.Quantity,
		})
	}
	return items
}
