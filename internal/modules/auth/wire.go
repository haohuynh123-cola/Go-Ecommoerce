package auth

import (
	"haohuynh123-cola/ecommce/internal/platform/config"

	"github.com/google/wire"
)

// ProvideJWTSecret extracts the secret key from JWTConfig for Wire injection.
func ProvideJWTSecret(cfg config.JWTConfig) string {
	return cfg.SecretKey
}

// WireSet aggregates the auth module providers for Wire DI.
var WireSet = wire.NewSet(
	NewUserRepository,
	NewUserCache,
	ProvideJWTSecret,
	NewAuthService,
	NewAuthHandler,
)
