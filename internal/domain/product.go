package domain

import (
	"context"
	"haohuynh123-cola/ecommce/internal/dto"
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
	CreateProduct(ctx context.Context, req *dto.CreateProductRequest) (*Product, error)
	GetProductByID(ctx context.Context, id int64) (*Product, error)
	UpdateProduct(ctx context.Context, id int64, req *dto.UpdateProductRequest) (*Product, error)
	DeleteProduct(ctx context.Context, id int64) error
	ListProducts(ctx context.Context, req dto.ProductFilter) ([]*Product, int64, error)
}

type ProductRepository interface {
	CreateProduct(ctx context.Context, product *Product) (*Product, error)
	GetProductByID(ctx context.Context, id int64) (*Product, error)
	GetProductByIDs(ctx context.Context, ids []int64) ([]*Product, error)
	UpdateProduct(ctx context.Context, id int64, product *Product) (*Product, error)
	DeleteProduct(ctx context.Context, id int64) error
	ListProducts(ctx context.Context, req ProductFilter) ([]*Product, error)
	GetProductBySKU(ctx context.Context, sku string) (*Product, error)
	GetTotalProducts(ctx context.Context) (int64, error)
}

type ProductCache interface {
	SetList(ctx context.Context, key string, products []*Product, totalItems int64) error
	GetList(ctx context.Context, key string) ([]*Product, int64, bool, error)
}
