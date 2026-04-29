package middleware

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type SlidingWindowLimiter struct {
	rdb    *redis.Client
	limit  int64
	window time.Duration
}

func NewRateLimiter(rdb *redis.Client, limit int64, window time.Duration) *SlidingWindowLimiter {
	return &SlidingWindowLimiter{rdb: rdb, limit: limit, window: window}
}

// Allow — kiểm tra 1 identifier có được phép hay không
func (l *SlidingWindowLimiter) Allow(ctx context.Context, identifier string) (bool, int64, error) {
	key := "rate:sw:" + identifier
	now := time.Now().UnixNano()
	windowStart := now - l.window.Nanoseconds()

	pipe := l.rdb.TxPipeline()
	pipe.ZRemRangeByScore(ctx, key, "0", fmt.Sprintf("%d", windowStart))
	pipe.ZAdd(ctx, key, redis.Z{Score: float64(now), Member: now})
	countCmd := pipe.ZCard(ctx, key)
	pipe.Expire(ctx, key, l.window)

	if _, err := pipe.Exec(ctx); err != nil {
		return false, 0, err
	}

	count := countCmd.Val()
	remaining := l.limit - count
	if remaining < 0 {
		remaining = 0
	}
	return count <= l.limit, remaining, nil
}

// Middleware — Gin middleware apply limiter to route
func (l *SlidingWindowLimiter) Middleware(scope string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Mỗi IP có bucket riêng
		identifier := scope + ":" + c.ClientIP()

		ok, remaining, err := l.Allow(c.Request.Context(), identifier)
		if err != nil {
			// Redis lỗi → fail-open, cho qua
			c.Next()
			return
		}

		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", l.limit))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))

		if !ok {
			c.Header("Retry-After", fmt.Sprintf("%.0f", l.window.Seconds()))
			c.JSON(http.StatusTooManyRequests, gin.H{
				"code":    "rate_limited",
				"message": "too many requests",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
