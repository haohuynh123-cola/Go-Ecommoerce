package dto

type CartItem struct {
	ProductID int64 `json:"product_id" binding:"required"`
	Quantity  int   `json:"quantity" binding:"required,min=1"`
}

type AddToCartRequest struct {
	ProductID int64 `json:"product_id" binding:"required"`
	Quantity  int   `json:"quantity" binding:"required,min=1"`
	UserID    int64 `json:"user_id" binding:"omitempty"` // Optional, can be set from context in service layer
}

type UpdateCartItemRequest struct {
	ProductID int64 `json:"product_id" binding:"required"`
	Quantity  int   `json:"quantity" binding:"required,min=1"`
	UserID    int64 `json:"user_id" binding:"omitempty"` // Optional, can be set from context in service layer
}

type RemoveFromCartRequest struct {
	ProductID int64 `json:"product_id" binding:"required"`
	UserID    int64 `json:"user_id" binding:"omitempty"` // Optional, can be set from context in service layer
}
