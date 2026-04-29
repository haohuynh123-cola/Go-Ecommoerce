package order

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type OrderCache struct {
	rdb *redis.Client
	ttl time.Duration
}

func NewOrderCache(redisClient *redis.Client, ttl time.Duration) *OrderCache {
	return &OrderCache{
		rdb: redisClient,
		ttl: ttl,
	}
}

func key(orderID int64) string {
	return fmt.Sprintf("order:%d", orderID)
}

func (c *OrderCache) SetOrder(ctx context.Context, orderID int64, data interface{}) error {
	// Implement logic to set order data in cache
	key := key(orderID)
	payload, err := json.Marshal(data)

	if err != nil {
		return err
	}

	return c.rdb.Set(ctx, key, payload, c.ttl).Err()
}

func (c *OrderCache) GetOrder(ctx context.Context, orderID int64) (interface{}, error) {
	// Implement logic to get order data from cache
	key := key(orderID)
	data, err := c.rdb.Get(ctx, key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, nil // Cache miss
		}
		return nil, err
	}
	var result interface{}
	err = json.Unmarshal(data, &result)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func (c *OrderCache) DeleteOrder(ctx context.Context, orderID int64) error {
	// Implement logic to delete order data from cache
	key := key(orderID)
	return c.rdb.Del(ctx, key).Err()
}
