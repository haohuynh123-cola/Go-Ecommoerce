package service

import (
	"context"
	"haohuynh123-cola/ecommce/internal/domain"
)

type ProductService struct {
	service domain.IProductService
}

func NewProductService(service domain.IProductService) domain.IProductService {
	return &ProductService{
		service: service,
	}
}

func (s *ProductService) ListProducts(ctx context.Context) ([]*domain.Product, error) {
	// Implement logic to list all products
	products, err := s.service.ListProducts(ctx)
	if err != nil {
		return nil, err
	}
	return products, nil
}

func (s *ProductService) GetProductByID(ctx context.Context, id int64) (*domain.Product, error) {
	// Implement logic to get a product by ID
	return nil, nil
}

func (s *ProductService) CreateProduct(ctx context.Context, product *domain.Product) (*domain.Product, error) {
	// Implement logic to create a new product
	return nil, nil
}

func (s *ProductService) UpdateProduct(ctx context.Context, product *domain.Product) (*domain.Product, error) {
	// Implement logic to update an existing product
	return nil, nil
}

func (s *ProductService) DeleteProduct(ctx context.Context, id int64) error {
	// Implement logic to delete a product
	return nil
}
