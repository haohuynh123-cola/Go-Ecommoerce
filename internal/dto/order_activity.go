package dto

type OrderActivityResponse struct {
	OrderID      int64  `json:"order_id"`
	ActivityType string `json:"activity_type"`
	Description  string `json:"description"`
	ActivityAt   string `json:"activity_at"`
}
