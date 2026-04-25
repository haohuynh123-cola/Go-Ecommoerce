package cache

import (
	"context"
	"encoding/json"
	"haohuynh123-cola/ecommce/internal/domain"
	"time"

	"github.com/redis/go-redis/v9"
)

type CartCache struct {
	rdb *redis.Client
	ttl time.Duration
}

type CartItem struct {
	Product  *domain.Product `json:"product"`
	Quantity int             `json:"quantity"`
}

func NewCartCache(rdb *redis.Client, ttl time.Duration) *CartCache {
	return &CartCache{rdb: rdb, ttl: ttl}
}

func (c *CartCache) GetCartItems(ctx context.Context, key string) ([]*domain.CartItem, bool, error) {
	// Implement logic to get cart items from cache
	// For now, we return nil to indicate cache miss

	data, err := c.rdb.Get(ctx, key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, false, nil
		}
		return nil, false, err
	}
	var items []*domain.CartItem
	err = json.Unmarshal(data, &items)
	if err != nil {
		return nil, false, err
	}
	return items, true, nil

}

func (c *CartCache) SetCartItems(ctx context.Context, key string, items []*domain.CartItem) error {
	// Implement logic to set cart items in cache
	payload, err := json.Marshal(items)

	if err != nil {
		return err
	}

	// Set the cache with a TTL (e.g., 30 minutes)
	return c.rdb.Set(ctx, key, payload, c.ttl).Err()
}

func (c *CartCache) ClearCart(ctx context.Context, key string) error {
	// Implement logic to clear cart in cache
	return c.rdb.Del(ctx, key).Err()
}
