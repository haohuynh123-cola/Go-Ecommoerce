package product

import "github.com/google/wire"

// WireSet aggregates the product module providers for Wire DI.
var WireSet = wire.NewSet(
	NewProductRepository,
	NewProductCache,
	NewProductService,
	NewProductHandler,
)
