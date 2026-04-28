package service

import (
	"context"
	"errors"
	"fmt"
	"haohuynh123-cola/ecommce/internal/domain"
	"haohuynh123-cola/ecommce/internal/dto"
	"time"
)

type OrderService struct {
	repo         domain.OrderRepository
	orderItem    domain.OrderItemRepository
	productRepo  domain.ProductRepository
	activityRepo domain.OrderActivityRepository
}

func NewOrderService(repo domain.OrderRepository, orderItem domain.OrderItemRepository, productRepo domain.ProductRepository, activityRepo domain.OrderActivityRepository) domain.OrderService {
	return &OrderService{
		repo:         repo,
		orderItem:    orderItem,
		productRepo:  productRepo,
		activityRepo: activityRepo,
	}
}

func (s *OrderService) CreateOrder(ctx context.Context, req *dto.CreateOrderRequest) (*dto.CreateOrderResponse, error) {

	//Get Product details and calculate total amount
	orderItems := make([]domain.OrderItem, len(req.Items))
	var totalAmount float64
	for i, item := range req.Items {
		product, err := s.productRepo.GetProductByID(ctx, item.ProductID)
		if err != nil {
			if errors.Is(err, domain.ErrProductNotFound) {
				return nil, domain.ErrProductNotFound
			}
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
		Status:      "Created",
	}

	order, err := s.repo.CreateOrder(ctx, orderDomain)
	if err != nil {
		return nil, err
	}

	//Create order Items no polem N+1 problem because we have orderID after creating order
	for _, item := range orderItems {
		orderItem := &domain.OrderItem{
			OrderID:   order.ID,
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Price,
		}
		if err := s.orderItem.CreateOrderItems(ctx, []*domain.OrderItem{orderItem}); err != nil {
			return nil, err
		}
	}

	//Create order activity
	activity := &domain.OrderActivity{
		OrderID:      order.ID,
		ActivityType: "Order Created",
		Description:  "Order has been created with total amount " + fmt.Sprintf("%.2f", totalAmount),
		ActivityAt:   time.Now(), //format time MMMM dd, yyyy hh:mm:ss
	}

	if err := s.activityRepo.CreateOrderActivity(ctx, activity); err != nil {
		return nil, err
	}

	itemsResponse := make([]dto.CreateOrderItem, len(orderItems))
	for i, item := range orderItems {
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

func (s *OrderService) GetOrdersByUserID(ctx context.Context, customerID int64) ([]*dto.OrderResponse, error) {
	orders, err := s.repo.GetOrdersByUserID(ctx, customerID)
	if err != nil {
		if err == domain.ErrOrderNotFound {
			return nil, err
		}
		return nil, err
	}

	//Load order items for each order
	var response []*dto.OrderResponse
	for _, order := range orders {
		orderItems, err := s.orderItem.GetOrderItemsByOrderID(ctx, order.ID)
		if err != nil {
			return nil, err
		}

		var items []dto.OrderItemResponse
		for _, item := range orderItems {
			items = append(items, dto.OrderItemResponse{
				ProductID: item.ProductID,
				Quantity:  item.Quantity,
				Price:     item.Price,
			})
		}

		response = append(response, &dto.OrderResponse{
			ID:          order.ID,
			UserID:      order.UserID,
			OrderDate:   order.OrderDate,
			TotalAmount: order.TotalAmount,
			Status:      order.Status,
			Items:       items,
		})
	}

	return response, nil
}

func (s *OrderService) GetOrderByID(ctx context.Context, orderID int64) (*dto.GetOrderByIDResponse, error) {
	order, err := s.repo.GetOrderByID(ctx, orderID)
	if err != nil {
		return nil, err
	}

	var items []dto.OrderItemResponse
	//Load order items
	orderItems, err := s.orderItem.GetOrderItemsByOrderID(ctx, orderID)
	if err != nil {
		return nil, err
	}
	for _, item := range orderItems {
		items = append(items, dto.OrderItemResponse{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Price,
		})
	}

	//Load order activities
	var activities []dto.OrderActivityResponse
	activityQuery, err := s.activityRepo.GetOrderActivitiesByOrderID(ctx, orderID)
	if err != nil {
		return nil, err
	}
	for _, activity := range activityQuery {
		activities = append(activities, dto.OrderActivityResponse{
			OrderID:      activity.OrderID,
			ActivityType: activity.ActivityType,
			Description:  activity.Description,
			ActivityAt:   activity.ActivityAt.Format(time.RFC3339),
		})
	}

	return &dto.GetOrderByIDResponse{
		ID:          order.ID,
		UserID:      order.UserID,
		OrderDate:   order.OrderDate,
		TotalAmount: order.TotalAmount,
		Items:       items,
		Activities:  activities,
	}, nil
}

func (s *OrderService) GetActivitiesByOrderID(ctx context.Context, orderID int64) ([]*dto.OrderActivityResponse, error) {
	activities, err := s.activityRepo.GetOrderActivitiesByOrderID(ctx, orderID)
	if err != nil {
		if err == domain.ErrOrderNotFound {
			return nil, domain.ErrOrderNotFound
		}
		return nil, err
	}

	var response []*dto.OrderActivityResponse
	for _, activity := range activities {
		response = append(response, &dto.OrderActivityResponse{
			OrderID:      activity.OrderID,
			ActivityType: activity.ActivityType,
			Description:  activity.Description,
			ActivityAt:   activity.ActivityAt.Format(time.RFC3339),
		})
	}

	return response, nil
}
