package commentdto

type CommentDTO struct {
	ID      string `json:"id"`
	Comment string `json:"comment"`
	UserID  string `json:"user_id"`
}

// CreateComment is the struct for creating a new comment
type CreateComment struct {
	UserID          int64  `json:"user_id" binding:"required"`
	Comment         string `json:"comment" binding:"required"`
	ParentCommentID *int64 `json:"parent_comment_id,omitempty"`
	Rating          *int   `json:"rating,omitempty"`
	ProductID       int64  `json:"product_id" binding:"required"`
}

type CommentResponse struct {
	ID              int64  `json:"id"`
	ProductID       int64  `json:"product_id"`
	UserID          int64  `json:"user_id"`
	Comment         string `json:"comment"`
	ParentCommentID *int64 `json:"parent_comment_id,omitempty"`
	Rating          *int   `json:"rating,omitempty"`
}

// GetCommentsByProductIDResponse is the response struct for getting comments by product ID
type GetCommentsByProductIDResponse struct {
	Comments []CommentResponse `json:"comments"`
}
