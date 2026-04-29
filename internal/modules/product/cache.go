package product

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"
)

type ProductCache struct {
	rdb *redis.Client
	ttl time.Duration
}

func NewProductCache(rdb *redis.Client, ttl time.Duration) *ProductCache {
	return &ProductCache{
		rdb: rdb,
		ttl: ttl,
	}
}

type productListPayload struct {
	Products []*Product `json:"items"`
	Total    int64      `json:"total"`
}

// SetList - Add product list to cache
func (c *ProductCache) SetList(ctx context.Context, key string, products []*Product, total int64) error {
	// 1. Marshal to JSON
	payload, err := json.Marshal(productListPayload{
		Products: products,
		Total:    total,
	})
	if err != nil {
		return err
	}
	// Set the cache with the specified TTL
	return c.rdb.Set(ctx, key, payload, c.ttl).Err()
}

// GetList - Get product list from cache
func (c *ProductCache) GetList(ctx context.Context, key string) ([]*Product, int64, bool, error) {
	var payload productListPayload
	data, err := c.rdb.Get(ctx, key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, 0, false, nil
		}
		return nil, 0, false, err
	}
	err = json.Unmarshal(data, &payload)
	if err != nil {
		return nil, 0, false, err
	}
	return payload.Products, payload.Total, true, nil
}
