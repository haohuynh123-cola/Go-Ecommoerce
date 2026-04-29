package order

import (
	"context"
	"errors"
	"fmt"
	"time"

	orderdto "haohuynh123-cola/ecommce/internal/modules/order/dto"
	"haohuynh123-cola/ecommce/internal/modules/product"
	productdto "haohuynh123-cola/ecommce/internal/modules/product/dto"
	"haohuynh123-cola/ecommce/internal/shared/errs"
)

type OrderServiceImpl struct {
	repo         OrderRepository
	orderItem    OrderItemRepository
	productRepo  product.ProductRepository
	activityRepo OrderActivityRepository
	rdb          *OrderCache
}

func NewOrderService(repo OrderRepository, orderItem OrderItemRepository, productRepo product.ProductRepository, activityRepo OrderActivityRepository, rdb *OrderCache) OrderService {
	return &OrderServiceImpl{
		repo:         repo,
		orderItem:    orderItem,
		productRepo:  productRepo,
		activityRepo: activityRepo,
		rdb:          rdb,
	}
}

func (s *OrderServiceImpl) CreateOrder(ctx context.Context, req *orderdto.CreateOrderRequest) (*orderdto.CreateOrderResponse, error) {

	//Get Product details and calculate total amount
	orderItems := make([]OrderItem, len(req.Items))
	var totalAmount float64
	for i, item := range req.Items {
		p, err := s.productRepo.GetProductByID(ctx, item.ProductID)
		if err != nil {
			if errors.Is(err, errs.ErrProductNotFound) {
				return nil, errs.ErrProductNotFound
			}
			return nil, err
		}
		orderItems[i] = OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     p.Price,
		}
		totalAmount += float64(item.Quantity) * p.Price
	}

	var items []OrderItem
	for _, item := range orderItems {
		items = append(items, OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Price,
		})
	}

	orderDomain := &Order{
		UserID:      req.UserID,
		OrderDate:   time.Now(),
		TotalAmount: totalAmount,
		Status:      "Created",
	}

	o, err := s.repo.CreateOrder(ctx, orderDomain)
	if err != nil {
		return nil, err
	}

	//Create order Items no polem N+1 problem because we have orderID after creating order
	for _, item := range orderItems {
		orderItem := &OrderItem{
			OrderID:   o.ID,
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Price,
		}
		if err := s.orderItem.CreateOrderItems(ctx, []*OrderItem{orderItem}); err != nil {
			return nil, err
		}
	}

	//Create order activity
	activity := &OrderActivity{
		OrderID:      o.ID,
		ActivityType: "Order Created",
		Description:  "Order has been created with total amount " + fmt.Sprintf("%.2f", totalAmount),
		ActivityAt:   time.Now(), //format time MMMM dd, yyyy hh:mm:ss
	}

	if err := s.activityRepo.CreateOrderActivity(ctx, activity); err != nil {
		return nil, err
	}

	itemsResponse := make([]orderdto.CreateOrderItem, len(orderItems))
	for i, item := range orderItems {
		itemsResponse[i] = orderdto.CreateOrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Price,
		}
	}

	return &orderdto.CreateOrderResponse{
		ID:          o.ID,
		UserID:      o.UserID,
		OrderDate:   o.OrderDate,
		TotalAmount: o.TotalAmount,
		Items:       itemsResponse,
	}, nil
}

func (s *OrderServiceImpl) GetOrdersByUserID(ctx context.Context, customerID int64) ([]*orderdto.OrderResponse, error) {
	orders, err := s.repo.GetOrdersByUserID(ctx, customerID)
	if err != nil {
		if errors.Is(err, errs.ErrOrderNotFound) {
			return nil, err
		}
		return nil, err
	}

	//Load order items for each order
	var resp []*orderdto.OrderResponse
	for _, o := range orders {
		orderItems, err := s.orderItem.GetOrderItemsByOrderID(ctx, o.ID)
		if err != nil {
			return nil, err
		}

		var items []orderdto.OrderItemResponse
		for _, item := range orderItems {
			items = append(items, orderdto.OrderItemResponse{
				ProductID: item.ProductID,
				Quantity:  item.Quantity,
				Price:     item.Price,
			})
		}

		resp = append(resp, &orderdto.OrderResponse{
			ID:          o.ID,
			UserID:      o.UserID,
			OrderDate:   o.OrderDate,
			TotalAmount: o.TotalAmount,
			Status:      o.Status,
			Items:       items,
		})
	}

	return resp, nil
}

// GetOrderByID implements domain.OrderService
func (s *OrderServiceImpl) GetOrderByID(ctx context.Context, orderID int64) (*orderdto.GetOrderByIDResponse, error) {
	getCache, err := s.rdb.GetOrder(ctx, orderID)
	if err == nil {
		if cachedData, ok := getCache.(*orderdto.GetOrderByIDResponse); ok {
			return cachedData, nil
		}
	}
	o, err := s.repo.GetOrderByID(ctx, orderID)
	if err != nil {
		return nil, err
	}

	var items []orderdto.OrderItemResponse
	//Load order items
	orderItems, err := s.orderItem.GetOrderItemsByOrderID(ctx, orderID)
	if err != nil {
		return nil, err
	}
	for _, item := range orderItems {
		items = append(items, orderdto.OrderItemResponse{
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

	productMap := make(map[int64]*product.Product)
	for _, p := range products {
		productMap[p.ID] = p
	}

	for i, item := range items {
		p, ok := productMap[item.ProductID]
		if !ok {
			return nil, errs.ErrProductNotFound
		}
		items[i].Product = &productdto.Product{
			ID:          p.ID,
			Name:        p.Name,
			Description: p.Description,
			SKU:         p.SKU,
			Price:       p.Price,
		}
	}

	//Load order activities
	var activities []orderdto.OrderActivityResponse
	activityQuery, err := s.activityRepo.GetOrderActivitiesByOrderID(ctx, orderID)
	if err != nil {
		return nil, err
	}
	for _, activity := range activityQuery {
		activities = append(activities, orderdto.OrderActivityResponse{
			OrderID:      activity.OrderID,
			ActivityType: activity.ActivityType,
			Description:  activity.Description,
			ActivityAt:   activity.ActivityAt.Format(time.RFC3339),
		})
	}

	//Set cache
	cacheData := &orderdto.GetOrderByIDResponse{
		ID:          o.ID,
		UserID:      o.UserID,
		OrderDate:   o.OrderDate,
		TotalAmount: o.TotalAmount,
		Status:      o.Status,
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
func (s *OrderServiceImpl) UpdateOrderStatus(ctx context.Context, orderID int64, newStatus string) (*orderdto.GetOrderByIDResponse, error) {
	if !IsValidOrderStatus(newStatus) {
		return nil, errs.ErrInvalidOrderStatus
	}

	o, err := s.repo.GetOrderByID(ctx, orderID)
	if err != nil {
		return nil, err
	}

	activity := &OrderActivity{
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
	_ = o // order was fetched only to confirm existence; GetOrderByID re-fetches it.
	return s.GetOrderByID(ctx, orderID)
}

func (s *OrderServiceImpl) GetActivitiesByOrderID(ctx context.Context, orderID int64) ([]*orderdto.OrderActivityResponse, error) {
	activities, err := s.activityRepo.GetOrderActivitiesByOrderID(ctx, orderID)
	if err != nil {
		if err == errs.ErrOrderNotFound {
			return nil, errs.ErrOrderNotFound
		}
		return nil, err
	}

	var resp []*orderdto.OrderActivityResponse
	for _, activity := range activities {
		resp = append(resp, &orderdto.OrderActivityResponse{
			OrderID:      activity.OrderID,
			ActivityType: activity.ActivityType,
			Description:  activity.Description,
			ActivityAt:   activity.ActivityAt.Format(time.RFC3339),
		})
	}

	return resp, nil
}
