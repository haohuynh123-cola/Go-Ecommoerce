package service

import (
	"context"
	"errors"
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
	//Check Item exist in cart or not
	cartExist, err := s.repo.GetProductInCart(ctx, cart.UserID, cart.ProductID)
	if err != nil && !errors.Is(err, domain.ErrCartItemNotFound) {
		return fmt.Errorf("failed to look up cart item: %w", err)
	}

	if cartExist != nil {
		// If the item already exists in the cart, update the quantity
		cartExist.Quantity += cart.Quantity

		err = s.UpdateCartItem(ctx, &dto.UpdateCartItemRequest{
			UserID:    cart.UserID,
			ProductID: cart.ProductID,
			Quantity:  cartExist.Quantity,
		})
		if err != nil {
			return fmt.Errorf("failed to update cart item: %w", err)
		}

		return nil
	}

	cartItem := &domain.Cart{
		UserID:    cart.UserID,
		ProductID: cart.ProductID,
		Quantity:  cart.Quantity,
	}

	if err := s.repo.AddToCart(ctx, cartItem); err != nil {
		return fmt.Errorf("failed to add item to cart: %w", err)
	}

	// Invalidate cached cart so the next GET /cart/items reflects the new item.
	_ = s.rdb.ClearCart(ctx, keyCache(cart.UserID))
	return nil
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

func (s *CartService) RemoveFromCart(ctx context.Context, req *dto.RemoveFromCartRequest) error {
	cartExist, err := s.repo.GetProductInCart(ctx, req.UserID, req.ProductID)
	if err != nil {
		return fmt.Errorf("failed to look up cart item: %w", err)
	}
	if cartExist == nil {
		return domain.ErrProductNotFound
	}

	if err := s.repo.RemoveFromCart(ctx, req.UserID, req.ProductID); err != nil {
		return fmt.Errorf("failed to remove cart item: %w", err)
	}

	// Invalidate cache after the DB write succeeds.
	_ = s.rdb.ClearCart(ctx, keyCache(req.UserID))
	return nil
}

func (s *CartService) UpdateCartItem(ctx context.Context, cart *dto.UpdateCartItemRequest) error {
	cartExist, err := s.repo.GetProductInCart(ctx, cart.UserID, cart.ProductID)
	if err != nil {
		return fmt.Errorf("failed to look up cart item: %w", err)
	}
	if cartExist == nil {
		return domain.ErrProductNotFound
	}

	cartItem := &domain.Cart{
		UserID:    cart.UserID,
		ProductID: cart.ProductID,
		Quantity:  cart.Quantity,
	}

	if err := s.repo.UpdateCartItem(ctx, cartItem); err != nil {
		return fmt.Errorf("failed to update cart item: %w", err)
	}

	// Invalidate cache so the next read repopulates from the DB with the joined product.
	_ = s.rdb.ClearCart(ctx, keyCache(cart.UserID))
	return nil
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
