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
	product, err := s.repo.GetProductByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, domain.ErrProductNotFound
	}
	return product, nil
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

func (s *ProductService) UpdateProduct(ctx context.Context, id int64, req *dto.UpdateProductRequest) (*domain.Product, error) {
	//check if product exists
	existingProduct, err := s.repo.GetProductByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if existingProduct == nil {
		return nil, domain.ErrProductNotFound
	}

	// Convert UpdateProductRequest to Product domain model
	product := &domain.Product{
		Name:        req.Name,
		Description: req.Description,
		SKU:         req.SKU,
		Price:       req.Price,
		Stock:       req.Stock,
	}

	updatedProduct, err := s.repo.UpdateProduct(ctx, id, product)
	if err != nil {
		return nil, err
	}
	return updatedProduct, nil
	// Implement logic to update an existing product
}

func (s *ProductService) DeleteProduct(ctx context.Context, id int64) error {
	// Implement logic to delete a product
	// Check if product exists
	existingProduct, err := s.repo.GetProductByID(ctx, id)
	if err != nil {
		return err
	}
	if existingProduct == nil {
		return domain.ErrProductNotFound
	}

	err = s.repo.DeleteProduct(ctx, id)
	if err != nil {
		return err
	}
	return nil
}
