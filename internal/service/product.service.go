package service

import (
	"context"
	"fmt"
	"haohuynh123-cola/ecommce/internal/cache"
	"haohuynh123-cola/ecommce/internal/domain"
	"haohuynh123-cola/ecommce/internal/dto"
)

type ProductService struct {
	repo  domain.ProductRepository
	cache *cache.ProductCache
}

func NewProductService(repo domain.ProductRepository, cache *cache.ProductCache) domain.ProductService {
	return &ProductService{
		repo:  repo,
		cache: cache,
	}
}

func productListKey(f dto.ProductFilter) string {
	return fmt.Sprintf("products:list:name=%s:sku=%s:page=%d:page_size=%d", f.Name, f.SKU, f.Page, f.PageSize)
}

func (s *ProductService) ListProducts(ctx context.Context, req dto.ProductFilter) ([]*domain.Product, int64, error) {
	key := productListKey(req)

	// Implement logic to list all products
	filter := domain.ProductFilter{
		Name:     req.Name,
		SKU:      req.SKU,
		Page:     req.Page,
		PageSize: req.PageSize,
	}

	//Get from cache first
	if items, total, hit, _ := s.cache.GetList(ctx, key); hit {
		return items, total, nil
	}

	products, err := s.repo.ListProducts(ctx, filter)
	if err != nil {
		return nil, 0, err
	}
	totalItems, err := s.repo.GetTotalProducts(ctx)
	if err != nil {
		return nil, 0, err
	}

	// Set to cache
	_ = s.cache.SetList(ctx, key, products, totalItems)
	return products, totalItems, nil
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
	if existingProduct {
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

func (s *ProductService) DeleteProduct(ctx context.Context, id int64) (bool, error) {
	// Implement logic to delete a product
	// Check if product exists
	// Check Product exists Cart before delete
	// Check Product exists Order before delete

	existingProduct, err := s.repo.GetProductByID(ctx, id)
	if err != nil {
		if err == domain.ErrProductNotFound {
			return false, nil
		}
		return false, err
	}
	if existingProduct == nil {
		return false, domain.ErrProductNotFound
	}

	deleted, err := s.repo.DeleteProduct(ctx, id)
	if err != nil {
		return false, err
	}
	return deleted, nil
}
