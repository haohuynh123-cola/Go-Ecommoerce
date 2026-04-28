package service

import (
	"context"
	"errors"
	"fmt"
	"haohuynh123-cola/ecommce/internal/cache"
	"haohuynh123-cola/ecommce/internal/domain"
	"haohuynh123-cola/ecommce/internal/dto"
	"time"
)

type OrderService struct {
	repo         domain.OrderRepository
	orderItem    domain.OrderItemRepository
	productRepo  domain.ProductRepository
	activityRepo domain.OrderActivityRepository
	rdb          *cache.OrderCache
}

func NewOrderService(repo domain.OrderRepository, orderItem domain.OrderItemRepository, productRepo domain.ProductRepository, activityRepo domain.OrderActivityRepository, rdb *cache.OrderCache) domain.OrderService {
	return &OrderService{
		repo:         repo,
		orderItem:    orderItem,
		productRepo:  productRepo,
		activityRepo: activityRepo,
		rdb:          rdb,
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

// GetOrderByID implements domain.OrderService
func (s *OrderService) GetOrderByID(ctx context.Context, orderID int64) (*dto.GetOrderByIDResponse, error) {
	getCache, err := s.rdb.GetOrder(ctx, orderID)
	if err == nil {
		if cachedData, ok := getCache.(*dto.GetOrderByIDResponse); ok {
			return cachedData, nil
		}
	}
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

	//Load product details for each order item
	productIDs := make([]int64, len(items))
	for i, item := range items {
		productIDs[i] = item.ProductID
	}

	products, err := s.productRepo.GetProductByIDs(ctx, productIDs)
	if err != nil {
		return nil, err
	}

	productMap := make(map[int64]*domain.Product)
	for _, product := range products {
		productMap[product.ID] = product
	}

	for i, item := range items {
		product, ok := productMap[item.ProductID]
		if !ok {
			return nil, domain.ErrProductNotFound
		}
		items[i].Product = &dto.Product{
			ID:          product.ID,
			Name:        product.Name,
			Description: product.Description,
			SKU:         product.SKU,
			Price:       product.Price,
		}
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

	//Set cache
	cacheData := &dto.GetOrderByIDResponse{
		ID:          order.ID,
		UserID:      order.UserID,
		OrderDate:   order.OrderDate,
		TotalAmount: order.TotalAmount,
		Status:      order.Status,
		Items:       items,
		Activities:  activities,
	}
	if err := s.rdb.SetOrder(ctx, orderID, cacheData); err != nil {
		fmt.Printf("Failed to set cache for order %d: %v\n", orderID, err)
	}

	return cacheData, nil
}

// UpdateOrderStatus validates the new status, writes the status change and a
// matching activity record atomically, invalidates the order cache, then
// returns the refreshed order detail.
func (s *OrderService) UpdateOrderStatus(ctx context.Context, orderID int64, newStatus string) (*dto.GetOrderByIDResponse, error) {
	if !domain.IsValidOrderStatus(newStatus) {
		return nil, domain.ErrInvalidOrderStatus
	}

	order, err := s.repo.GetOrderByID(ctx, orderID)
	if err != nil {
		return nil, err
	}

	activity := &domain.OrderActivity{
		OrderID:      orderID,
		ActivityType: "status_changed",
		Description:  fmt.Sprintf("Status changed to %s", newStatus),
		ActivityAt:   time.Now(),
	}

	if err := s.repo.UpdateOrderStatusWithActivity(ctx, orderID, newStatus, activity); err != nil {
		return nil, fmt.Errorf("update order status with activity: %w", err)
	}

	// Invalidate the cached order so the next read reflects the new status.
	if err := s.rdb.DeleteOrder(ctx, orderID); err != nil {
		fmt.Printf("failed to invalidate cache for order %d: %v\n", orderID, err)
	}

	// Return the updated order detail — re-use GetOrderByID to build the full
	// response including items and activities rather than duplicating that logic.
	_ = order // order was fetched only to confirm existence; GetOrderByID re-fetches it.
	return s.GetOrderByID(ctx, orderID)
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
