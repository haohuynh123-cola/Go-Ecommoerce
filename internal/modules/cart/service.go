package cart

import (
	"context"
	"errors"
	"fmt"

	cartdto "haohuynh123-cola/ecommce/internal/modules/cart/dto"
	"haohuynh123-cola/ecommce/internal/shared/errs"
)

type CartServiceImpl struct {
	// You can add dependencies here, such as repositories
	repo CartRepository
	rdb  *CartCache
}

// NewCartService creates a new instance of CartService
func NewCartService(repo CartRepository, rdb *CartCache) CartService {
	return &CartServiceImpl{
		repo: repo,
		rdb:  rdb,
	}
}

func (s *CartServiceImpl) AddToCart(ctx context.Context, c *cartdto.AddToCartRequest) error {
	//Check Item exist in cart or not
	cartExist, err := s.repo.GetProductInCart(ctx, c.UserID, c.ProductID)
	if err != nil && !errors.Is(err, errs.ErrCartItemNotFound) {
		return fmt.Errorf("failed to look up cart item: %w", err)
	}

	if cartExist != nil {
		// If the item already exists in the cart, update the quantity
		cartExist.Quantity += c.Quantity

		err = s.UpdateCartItem(ctx, &cartdto.UpdateCartItemRequest{
			UserID:    c.UserID,
			ProductID: c.ProductID,
			Quantity:  cartExist.Quantity,
		})
		if err != nil {
			return fmt.Errorf("failed to update cart item: %w", err)
		}

		return nil
	}

	cartItem := &Cart{
		UserID:    c.UserID,
		ProductID: c.ProductID,
		Quantity:  c.Quantity,
	}

	if err := s.repo.AddToCart(ctx, cartItem); err != nil {
		return fmt.Errorf("failed to add item to cart: %w", err)
	}

	// Invalidate cached cart so the next GET /cart/items reflects the new item.
	_ = s.rdb.ClearCart(ctx, keyCache(c.UserID))
	return nil
}

func keyCache(userID int64) string {
	return fmt.Sprintf("cart:user:%d", userID)
}

func (s *CartServiceImpl) GetCartItems(ctx context.Context, userID int64) ([]*CartItem, error) {
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

func (s *CartServiceImpl) RemoveFromCart(ctx context.Context, req *cartdto.RemoveFromCartRequest) error {
	cartExist, err := s.repo.GetProductInCart(ctx, req.UserID, req.ProductID)
	if err != nil {
		return fmt.Errorf("failed to look up cart item: %w", err)
	}
	if cartExist == nil {
		return errs.ErrProductNotFound
	}

	if err := s.repo.RemoveFromCart(ctx, req.UserID, req.ProductID); err != nil {
		return fmt.Errorf("failed to remove cart item: %w", err)
	}

	// Invalidate cache after the DB write succeeds.
	_ = s.rdb.ClearCart(ctx, keyCache(req.UserID))
	return nil
}

func (s *CartServiceImpl) UpdateCartItem(ctx context.Context, c *cartdto.UpdateCartItemRequest) error {
	cartExist, err := s.repo.GetProductInCart(ctx, c.UserID, c.ProductID)
	if err != nil {
		return fmt.Errorf("failed to look up cart item: %w", err)
	}
	if cartExist == nil {
		return errs.ErrProductNotFound
	}

	cartItem := &Cart{
		UserID:    c.UserID,
		ProductID: c.ProductID,
		Quantity:  c.Quantity,
	}

	if err := s.repo.UpdateCartItem(ctx, cartItem); err != nil {
		return fmt.Errorf("failed to update cart item: %w", err)
	}

	// Invalidate cache so the next read repopulates from the DB with the joined product.
	_ = s.rdb.ClearCart(ctx, keyCache(c.UserID))
	return nil
}

func (s *CartServiceImpl) ClearCart(ctx context.Context, userID int64) error {
	// Implement logic to clear cart for a user
	key := keyCache(userID)
	// Clear the cache for the user
	_ = s.rdb.ClearCart(ctx, key)

	return s.repo.ClearCart(ctx, userID)
}

func toCartItems(carts []*Cart) []*CartItem {
	items := make([]*CartItem, 0, len(carts))
	for _, c := range carts {
		items = append(items, &CartItem{
			Product:  c.Product,
			Quantity: c.Quantity,
		})
	}
	return items
}
