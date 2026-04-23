package repo

import (
	"context"
	"haohuynh123-cola/ecommce/internal/domain"

	"github.com/jmoiron/sqlx"
)

type ProductRepository struct {
	db *sqlx.DB
}

func NewProductRepository(db *sqlx.DB) domain.IProductRepository {
	return &ProductRepository{
		db: db,
	}
}

func (r *ProductRepository) ListProducts(ctx context.Context) ([]*domain.Product, error) {
	query := `SELECT id, name, description, sku, price, stock FROM products`
	var products = make([]*domain.Product, 0)
	err := r.db.SelectContext(ctx, &products, query)
	if err != nil {
		return nil, err
	}
	return products, nil
}

func (r *ProductRepository) GetProductByID(ctx context.Context, id int64) (*domain.Product, error) {
	// Implement logic to get a product by ID from the database
	return nil, nil
}

func (r *ProductRepository) CreateProduct(ctx context.Context, product *domain.Product) (*domain.Product, error) {
	// Implement logic to create a new product in the database
	return nil, nil
}

func (r *ProductRepository) UpdateProduct(ctx context.Context, product *domain.Product) (*domain.Product, error) {
	// Implement logic to update an existing product in the database
	return nil, nil
}

func (r *ProductRepository) DeleteProduct(ctx context.Context, id int64) error {
	// Implement logic to delete a product from the database
	return nil
}
