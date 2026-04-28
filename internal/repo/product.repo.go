package repo

import (
	"context"
	"database/sql"
	"fmt"
	"haohuynh123-cola/ecommce/internal/domain"
	"haohuynh123-cola/ecommce/internal/helper"

	"github.com/jmoiron/sqlx"
)

type ProductRepository struct {
	db *sqlx.DB
}

func NewProductRepository(db *sqlx.DB) domain.ProductRepository {
	return &ProductRepository{
		db: db,
	}
}

func (r *ProductRepository) ListProducts(ctx context.Context, filter domain.ProductFilter) ([]*domain.Product, error) {
	var (
		conditions []string
		args       []any
	)

	if filter.Name != "" {
		conditions = append(conditions, "name LIKE ?")
		args = append(args, "%"+filter.Name+"%")
	}
	if filter.SKU != "" {
		conditions = append(conditions, "sku = ?")
		args = append(args, filter.SKU)
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + helper.JoinConditions(conditions, " AND ")
	}

	offset := helper.GetOffset(filter.Page, filter.PageSize)
	limit := helper.GetLimit(filter.PageSize)

	query := `SELECT id, name, description, sku, price, stock FROM products ` + whereClause + ` LIMIT ? OFFSET ?`

	var products = make([]*domain.Product, 0)
	err := r.db.SelectContext(ctx, &products, query, append(args, limit, offset)...)

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
			return nil, domain.ErrProductNotFound
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

func (r *ProductRepository) DeleteProduct(ctx context.Context, id int64) (bool, error) {
	// Implement logic to delete a product from the database
	query := `DELETE FROM products WHERE id = ?`
	result, err := r.db.ExecContext(ctx, query, id)

	if err != nil {
		fmt.Printf("Error deleting product: %v\n", err.Error())
		return false, err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return false, err
	}
	if rowsAffected == 0 {
		return false, domain.ErrProductNotFound
	}
	return true, nil

}

func (r *ProductRepository) GetProductBySKU(ctx context.Context, sku string) (bool, error) {
	// Implement logic to get a product by SKU from the database
	query := `SELECT sku FROM products WHERE sku = ? LIMIT 1` //select only id to check existence
	var id int64
	err := r.db.GetContext(ctx, &id, query, sku)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}
	return true, nil
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

func (r *ProductRepository) GetProductByIDs(ctx context.Context, ids []int64) ([]*domain.Product, error) {
	query, args, err := sqlx.In(`SELECT id, name, description, sku, price, stock FROM products WHERE id IN (?)`, ids)
	if err != nil {
		return nil, err
	}
	query = r.db.Rebind(query)

	var products []*domain.Product
	err = r.db.SelectContext(ctx, &products, query, args...)
	if err != nil {
		return nil, err
	}
	return products, nil
}
