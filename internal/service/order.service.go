package service

import (
	"context"
	"haohuynh123-cola/ecommce/internal/domain"
	"haohuynh123-cola/ecommce/internal/dto"
	"time"
)

type OrderService struct {
	repo        domain.OrderRepository
	productRepo domain.ProductRepository
}

func NewOrderService(repo domain.OrderRepository, productRepo domain.ProductRepository) domain.OrderService {
	return &OrderService{
		repo:        repo,
		productRepo: productRepo,
	}
}

func (s *OrderService) CreateOrder(ctx context.Context, req *dto.CreateOrderRequest) (*dto.CreateOrderResponse, error) {
	//Get Product details and calculate total amount
	orderItems := make([]domain.OrderItem, len(req.Items))
	var totalAmount float64
	for i, item := range req.Items {
		product, err := s.productRepo.GetProductByID(ctx, item.ProductID)
		if err != nil {
			return nil, err
		}
		orderItems[i] = domain.OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     product.Price,
		}
		totalAmount += float64(item.Quantity) * product.Price
	}

	var items []domain.OrderItem
	for _, item := range orderItems {
		items = append(items, domain.OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Price,
		})
	}

	orderDomain := &domain.Order{
		UserID:      req.UserID,
		OrderDate:   time.Now(),
		TotalAmount: totalAmount,
		Items:       items,
	}

	order, err := s.repo.CreateOrder(ctx, orderDomain)
	if err != nil {
		return nil, err
	}

	itemsResponse := make([]dto.CreateOrderItem, len(order.Items))
	for i, item := range order.Items {
		itemsResponse[i] = dto.CreateOrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Price,
		}
	}

	return &dto.CreateOrderResponse{
		ID:          order.ID,
		UserID:      order.UserID,
		OrderDate:   order.OrderDate,
		TotalAmount: order.TotalAmount,
		Items:       itemsResponse,
	}, nil
}

func (s *OrderService) GetOrdersByUserID(ctx context.Context, customerID int64) ([]*dto.CreateOrderResponse, error) {
	orders, err := s.repo.GetOrdersByUserID(ctx, customerID)
	if err != nil {
		if err == domain.ErrOrderNotFound {
			return nil, domain.ErrOrderNotFound // Return empty slice if no orders found
		}
		return nil, err
	}

	var response []*dto.CreateOrderResponse
	for _, order := range orders {
		var items []dto.CreateOrderItem
		for _, item := range order.Items {
			items = append(items, dto.CreateOrderItem{
				ProductID: item.ProductID,
				Quantity:  item.Quantity,
				Price:     item.Price,
			})
		}

		response = append(response, &dto.CreateOrderResponse{
			ID:          order.ID,
			UserID:      order.UserID,
			OrderDate:   order.OrderDate,
			TotalAmount: order.TotalAmount,
			Items:       items,
		})
	}

	return response, nil
}

func (s *OrderService) GetOrderByID(ctx context.Context, orderID int64) (*dto.CreateOrderResponse, error) {
	order, err := s.repo.GetOrderByID(ctx, orderID)
	if err != nil {
		if err == domain.ErrOrderNotFound {
			return nil, domain.ErrOrderNotFound
		}
		if err == domain.ErrProductNotFound {
			return nil, domain.ErrProductNotFound
		}
		return nil, err
	}

	var items []dto.CreateOrderItem
	for _, item := range order.Items {
		items = append(items, dto.CreateOrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Price,
			Product: &dto.Product{
				ID:          item.Product.ID,
				Name:        item.Product.Name,
				Description: item.Product.Description,
				SKU:         item.Product.SKU,
			},
		})
	}

	return &dto.CreateOrderResponse{
		ID:          order.ID,
		UserID:      order.UserID,
		OrderDate:   order.OrderDate,
		TotalAmount: order.TotalAmount,
		Items:       items,
	}, nil
}
