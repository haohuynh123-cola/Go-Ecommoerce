package comment

import (
	"context"
	commentdto "haohuynh123-cola/ecommce/internal/modules/comment/dto"

	"github.com/jmoiron/sqlx"
)

type CommentRepositoryImpl struct {
	db *sqlx.DB
}

func NewCommentRepository(db *sqlx.DB) CommentRepository {
	return &CommentRepositoryImpl{db: db}
}

func (r *CommentRepositoryImpl) CreateComment(ctx context.Context, comment *commentdto.CreateComment) (*Comment, error) {
	query := "INSERT INTO product_comments (product_id, user_id, comment, parent_comment_id, rating) VALUES (?, ?, ?, ?, ?)"
	result, err := r.db.ExecContext(ctx, query, comment.ProductID, comment.UserID, comment.Comment, comment.ParentCommentID, comment.Rating)
	if err != nil {
		return nil, err
	}

	commentID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return &Comment{
		ID:              commentID,
		ProductID:       comment.ProductID,
		UserID:          comment.UserID,
		Comment:         comment.Comment,
		ParentCommentID: comment.ParentCommentID,
		Rating:          comment.Rating,
	}, nil
}

func (r *CommentRepositoryImpl) GetCommentsByProductID(ctx context.Context, productID int64) ([]*Comment, error) {
	query := "SELECT id, product_id, user_id, comment, parent_comment_id, rating FROM product_comments WHERE product_id = ?"

	var comments []*Comment
	err := r.db.SelectContext(ctx, &comments, query, productID)
	if err != nil {
		return nil, err
	}
	return comments, nil
}
