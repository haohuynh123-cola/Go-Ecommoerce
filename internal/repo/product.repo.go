package repo

import (
	"context"
	"database/sql"
	"haohuynh123-cola/ecommce/internal/domain"
	"haohuynh123-cola/ecommce/internal/helper"

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

func (r *ProductRepository) ListProducts(ctx context.Context, page, pageSize int) ([]*domain.Product, error) {
	offset := helper.GetOffset(page, pageSize)
	limit := helper.GetLimit(pageSize)

	query := `SELECT id, name, description, sku, price, stock FROM products LIMIT ? OFFSET ?`
	var products = make([]*domain.Product, 0)
	err := r.db.SelectContext(ctx, &products, query, limit, offset)
	if err != nil {
		return nil, err
	}
	return products, nil
}

func (r *ProductRepository) GetProductByID(ctx context.Context, id int64) (*domain.Product, error) {
	// Implement logic to get a product by ID from the database
	query := `SELECT id, name, description, sku, price, stock FROM products WHERE id = ? LIMIT 1`
	var product domain.Product
	err := r.db.GetContext(ctx, &product, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &product, nil
}

func (r *ProductRepository) CreateProduct(ctx context.Context, product *domain.Product) (*domain.Product, error) {
	// Implement logic to create a new product in the database
	query := `INSERT INTO products(name, description, sku, price, stock) VALUES(?,?,?,?,?)`

	result, err := r.db.ExecContext(
		ctx,
		query,
		product.Name,
		product.Description,
		product.SKU,
		product.Price,
		product.Stock,
	)

	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	product.ID = id

	return product, nil
}

func (r *ProductRepository) UpdateProduct(ctx context.Context, id int64, product *domain.Product) (*domain.Product, error) {
	// Implement logic to update an existing product in the database
	query := `UPDATE products SET name = ?, description = ?, sku = ?, price = ?, stock = ? WHERE id = ?`

	_, err := r.db.ExecContext(
		ctx,
		query,
		product.Name,
		product.Description,
		product.SKU,
		product.Price,
		product.Stock,
		id,
	)

	if err != nil {
		return nil, err
	}

	product.ID = id

	return product, nil
}

func (r *ProductRepository) DeleteProduct(ctx context.Context, id int64) error {
	// Implement logic to delete a product from the database
	query := `DELETE FROM products WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	return nil
}

func (r *ProductRepository) GetProductBySKU(ctx context.Context, sku string) (*domain.Product, error) {
	// Implement logic to get a product by SKU from the database
	query := `SELECT id, name, description, sku, price, stock FROM products WHERE sku = ? LIMIT 1`
	var product domain.Product
	err := r.db.GetContext(ctx, &product, query, sku)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &product, nil
}

func (r *ProductRepository) GetTotalProducts(ctx context.Context) (int64, error) {
	// Implement logic to get total number of products from the database
	query := `SELECT COUNT(*) FROM products`
	var count int64
	err := r.db.GetContext(ctx, &count, query)
	if err != nil {
		return 0, err
	}
	return count, nil
}
