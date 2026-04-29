//go:build wireinject
// +build wireinject

package di

import (
	"haohuynh123-cola/ecommce/internal/cache"
	"haohuynh123-cola/ecommce/internal/config"
	"haohuynh123-cola/ecommce/internal/handler"
	"haohuynh123-cola/ecommce/internal/repo"
	"haohuynh123-cola/ecommce/internal/service"
	"time"

	"github.com/google/wire"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

func provideJWTSecret(cfg config.JWTConfig) string {
	return cfg.SecretKey
}

var AuthSet = wire.NewSet(
	//Repositories
	repo.NewUserRepository,
	//Cache
	cache.NewUserCache,
	//Services
	provideJWTSecret,
	service.NewAuthService,
	handler.NewAuthHandler,
)

var ProductSet = wire.NewSet(
	//Repositories
	repo.NewProductRepository,
	//Cache
	cache.NewProductCache,
	//Services
	service.NewProductService,
	handler.NewProductHandler,
)

var CartSet = wire.NewSet(
	repo.NewCartRepository,
	cache.NewCartCache,
	service.NewCartService,
	handler.NewCartHandler,
)

var OrderSet = wire.NewSet(
	repo.NewOrderRepository,
	repo.NewOrderItemRepository,
	repo.NewProductRepository,
	repo.NewOrderActivityRepository,
	cache.NewOrderCache,
	service.NewOrderService,
	handler.NewOrderHandler,
)

func InitializeAuthHandler(db *sqlx.DB, rdb *redis.Client, cacheTTL time.Duration, jwtCfg config.JWTConfig, smtpCfg config.SMTPConfig) *handler.AuthHandler {
	wire.Build(AuthSet)
	return nil
}

func InitializeProductHandler(db *sqlx.DB, rdb *redis.Client, cacheTTL time.Duration) *handler.ProductHandler {
	wire.Build(ProductSet)
	return nil
}

func InitializeCartHandler(db *sqlx.DB, rdb *redis.Client, cacheTTL time.Duration, jwtCfg config.JWTConfig) *handler.CartHandler {
	wire.Build(CartSet)
	return nil
}

func InitializeOrderHandler(db *sqlx.DB, rdb *redis.Client, cacheTTL time.Duration, jwtCfg config.JWTConfig) *handler.OrderHandler {
	wire.Build(OrderSet)
	return nil
}
