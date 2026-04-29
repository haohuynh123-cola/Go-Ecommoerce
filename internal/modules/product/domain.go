package product

import (
	"context"

	productdto "haohuynh123-cola/ecommce/internal/modules/product/dto"
)

type Product struct {
	ID          int64   `db:"id" json:"id"`
	Name        string  `db:"name" json:"name"`
	Description string  `db:"description" json:"description"`
	SKU         string  `db:"sku" json:"sku"`
	Price       float64 `db:"price" json:"price"`
	Stock       int     `db:"stock" json:"stock"`
}

type ProductFilter struct {
	Name     string
	SKU      string
	Page     int
	PageSize int
}

type ProductService interface {
	CreateProduct(ctx context.Context, req *productdto.CreateProductRequest) (*Product, error)
	GetProductByID(ctx context.Context, id int64) (*Product, error)
	UpdateProduct(ctx context.Context, id int64, req *productdto.UpdateProductRequest) (*Product, error)
	DeleteProduct(ctx context.Context, id int64) (bool, error)
	ListProducts(ctx context.Context, req productdto.ProductFilter) ([]*Product, int64, error)
}

type ProductRepository interface {
	CreateProduct(ctx context.Context, product *Product) (*Product, error)
	GetProductByID(ctx context.Context, id int64) (*Product, error)
	GetProductByIDs(ctx context.Context, ids []int64) ([]*Product, error)
	UpdateProduct(ctx context.Context, id int64, product *Product) (*Product, error)
	DeleteProduct(ctx context.Context, id int64) (bool, error)
	ListProducts(ctx context.Context, req ProductFilter) ([]*Product, error)
	GetProductBySKU(ctx context.Context, sku string) (bool, error)
	GetTotalProducts(ctx context.Context) (int64, error)
}

type ProductCacheInterface interface {
	SetList(ctx context.Context, key string, products []*Product, totalItems int64) error
	GetList(ctx context.Context, key string) ([]*Product, int64, bool, error)
}
