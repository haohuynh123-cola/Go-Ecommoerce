package service

import (
	"context"
	"haohuynh123-cola/ecommce/internal/domain"
	"haohuynh123-cola/ecommce/internal/dto"
)

type ProductService struct {
	repo domain.IProductRepository
}

func NewProductService(repo domain.IProductRepository) domain.IProductService {
	return &ProductService{
		repo: repo,
	}
}

func (s *ProductService) ListProducts(ctx context.Context) ([]*domain.Product, error) {
	// Implement logic to list all products
	products, err := s.repo.ListProducts(ctx)
	if err != nil {
		return nil, err
	}
	return products, nil
}

func (s *ProductService) GetProductByID(ctx context.Context, id int64) (*domain.Product, error) {
	// Implement logic to get a product by ID
	return nil, nil
}

func (s *ProductService) CreateProduct(ctx context.Context, req *dto.CreateProductRequest) (*domain.Product, error) {
	// Implement logic to create a new product
	// Check if SKU already exists
	existingProduct, err := s.repo.GetProductBySKU(ctx, req.SKU)
	if err != nil {
		return nil, err
	}
	if existingProduct != nil {
		return nil, domain.ErrSKUAlreadyExists
	}
	// Convert CreateProductRequest to Product domain model
	product := &domain.Product{
		Name:        req.Name,
		Description: req.Description,
		SKU:         req.SKU,
		Price:       req.Price,
		Stock:       req.Stock,
	}

	createdProduct, err := s.repo.CreateProduct(ctx, product)
	if err != nil {
		return nil, err
	}
	return createdProduct, nil
}

func (s *ProductService) UpdateProduct(ctx context.Context, req *dto.UpdateProductRequest) (*domain.Product, error) {
	// Implement logic to update an existing product
	return nil, nil
}

func (s *ProductService) DeleteProduct(ctx context.Context, id int64) error {
	// Implement logic to delete a product
	return nil
}
