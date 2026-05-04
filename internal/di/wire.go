//go:build wireinject
// +build wireinject

package di

import (
	"time"

	"haohuynh123-cola/ecommce/internal/modules/auth"
	"haohuynh123-cola/ecommce/internal/modules/cart"
	"haohuynh123-cola/ecommce/internal/modules/comment"
	"haohuynh123-cola/ecommce/internal/modules/order"
	"haohuynh123-cola/ecommce/internal/modules/product"
	"haohuynh123-cola/ecommce/internal/platform/config"

	"github.com/google/wire"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

func InitializeAuthHandler(db *sqlx.DB, rdb *redis.Client, cacheTTL time.Duration, jwtCfg config.JWTConfig, smtpCfg config.SMTPConfig, oauthCfg config.OAuthConfig) *auth.AuthHandler {
	wire.Build(auth.WireSet)
	return nil
}

func InitializeProductHandler(db *sqlx.DB, rdb *redis.Client, cacheTTL time.Duration) *product.ProductHandler {
	wire.Build(product.WireSet)
	return nil
}

func InitializeCartHandler(db *sqlx.DB, rdb *redis.Client, cacheTTL time.Duration, jwtCfg config.JWTConfig) *cart.CartHandler {
	wire.Build(cart.WireSet)
	return nil
}

func InitializeOrderHandler(db *sqlx.DB, rdb *redis.Client, cacheTTL time.Duration, jwtCfg config.JWTConfig) *order.OrderHandler {
	wire.Build(order.WireSet)
	return nil
}

func InitializeCommentHandler(db *sqlx.DB, rdb *redis.Client, cacheTTL time.Duration, jwtCfg config.JWTConfig) *comment.CommentHandler {
	wire.Build(comment.WireSet)
	return nil
}
