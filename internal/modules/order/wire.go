package order

import (
	"haohuynh123-cola/ecommce/internal/modules/product"

	"github.com/google/wire"
)

// WireSet aggregates the order module providers for Wire DI.
// It pulls in the product repository constructor because the order service
// needs ProductRepository to look up product details.
var WireSet = wire.NewSet(
	NewOrderRepository,
	NewOrderItemRepository,
	product.NewProductRepository,
	NewOrderActivityRepository,
	NewOrderCache,
	NewOrderService,
	NewOrderHandler,
)
