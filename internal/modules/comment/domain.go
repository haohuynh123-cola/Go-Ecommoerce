package comment

import (
	"context"
	commentdto "haohuynh123-cola/ecommce/internal/modules/comment/dto"
)

// Entity
type Comment struct {
	ID              int64  `json:"id" db:"id"`
	ProductID       int64  `json:"product_id" db:"product_id"`
	UserID          int64  `json:"user_id" db:"user_id"`
	Comment         string `json:"comment" db:"comment"`
	ParentCommentID *int64 `json:"parent_comment_id,omitempty" db:"parent_comment_id"`
	Rating          *int   `json:"rating,omitempty" db:"rating"`
}

type CommentService interface {
	CreateComment(ctx context.Context, comment *commentdto.CreateComment) (*commentdto.CommentResponse, error)
	GetCommentsByProductID(ctx context.Context, productID int64) ([]*commentdto.CommentResponse, error)
}

type CommentRepository interface {
	CreateComment(ctx context.Context, comment *commentdto.CreateComment) (*Comment, error)
	GetCommentsByProductID(ctx context.Context, productID int64) ([]*Comment, error)
}
