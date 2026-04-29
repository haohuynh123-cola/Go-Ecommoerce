package cache

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type UserCache struct {
	rdb *redis.Client
	ttl time.Duration
}

func NewUserCache(rdb *redis.Client, ttl time.Duration) *UserCache {
	return &UserCache{
		rdb: rdb,
		ttl: ttl,
	}
}

func (c *UserCache) SetOTPRegister(ctx context.Context, key string, value string, ttl time.Duration) error {
	key = "otp_register:" + key
	return c.rdb.Set(ctx, key, value, ttl).Err()
}

func (c *UserCache) GetOTPRegister(ctx context.Context, key string) (string, bool, error) {
	key = "otp_register:" + key
	value, err := c.rdb.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return "", false, nil
		}
		return "", false, err
	}
	return value, true, nil
}

func (c *UserCache) ClearOTPRegister(ctx context.Context, key string) error {
	key = "otp_register:" + key
	return c.rdb.Del(ctx, key).Err()
}
