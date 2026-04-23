package domain

import (
	"context"
	"haohuynh123-cola/ecommce/internal/dto"
)

type Product struct {
	ID          int64   `db:"id"`
	Name        string  `db:"name"`
	Description string  `db:"description"`
	SKU         string  `db:"sku"`
	Price       float64 `db:"price"`
	Stock       int     `db:"stock"`
}

type IProductService interface {
	CreateProduct(ctx context.Context, req *dto.CreateProductRequest) (*Product, error)
	GetProductByID(ctx context.Context, id int64) (*Product, error)
	UpdateProduct(ctx context.Context, req *dto.UpdateProductRequest) (*Product, error)
	DeleteProduct(ctx context.Context, id int64) error
	ListProducts(ctx context.Context) ([]*Product, error)
}

type IProductRepository interface {
	CreateProduct(ctx context.Context, product *Product) (*Product, error)
	GetProductByID(ctx context.Context, id int64) (*Product, error)
	UpdateProduct(ctx context.Context, product *Product) (*Product, error)
	DeleteProduct(ctx context.Context, id int64) error
	ListProducts(ctx context.Context) ([]*Product, error)
	GetProductBySKU(ctx context.Context, sku string) (*Product, error)
}
