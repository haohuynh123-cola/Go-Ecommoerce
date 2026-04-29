package cart

import "github.com/google/wire"

// WireSet aggregates the cart module providers for Wire DI.
var WireSet = wire.NewSet(
	NewCartRepository,
	NewCartCache,
	NewCartService,
	NewCartHandler,
)
