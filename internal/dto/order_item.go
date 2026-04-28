package dto

type OrderItemResponse struct {
	ProductID int64    `json:"product_id"`
	Quantity  int      `json:"quantity"`
	Price     float64  `json:"price"`
	Product   *Product `json:"product,omitempty"`
}

// Order Request Create Item
type CreateOrderItem struct {
	ProductID int64   `json:"product_id" binding:"required"`
	Quantity  int     `json:"quantity" binding:"required,gt=0"`
	Price     float64 `json:"-" binding:"omitempty"` //price get in service layer, not required in request body
}
