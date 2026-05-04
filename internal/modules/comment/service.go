package comment

import (
	"context"
	"fmt"
	commentdto "haohuynh123-cola/ecommce/internal/modules/comment/dto"
)

type CommentServiceImpl struct {
	repo CommentRepository
}

func NewCommentService(repo CommentRepository) CommentService {
	return &CommentServiceImpl{repo: repo}
}

func (s *CommentServiceImpl) CreateComment(ctx context.Context, comment *commentdto.CreateComment) (*commentdto.CommentResponse, error) {
	commentCreate, err := s.repo.CreateComment(ctx, comment)
	if err != nil {
		return nil, fmt.Errorf("Err Create %v", err.Error())
	}
	response := &commentdto.CommentResponse{
		ID:              commentCreate.ID,
		ProductID:       commentCreate.ProductID,
		UserID:          commentCreate.UserID,
		Comment:         commentCreate.Comment,
		ParentCommentID: commentCreate.ParentCommentID,
		Rating:          commentCreate.Rating,
	}
	return response, nil
}

func (s *CommentServiceImpl) GetCommentsByProductID(ctx context.Context, productID int64) ([]*commentdto.CommentResponse, error) {
	comments, err := s.repo.GetCommentsByProductID(ctx, productID)
	if err != nil {
		return nil, fmt.Errorf("Err GetCommentsByProductID %v", err.Error())
	}

	var response []*commentdto.CommentResponse
	for _, comment := range comments {
		response = append(response, &commentdto.CommentResponse{
			ID:              comment.ID,
			ProductID:       comment.ProductID,
			UserID:          comment.UserID,
			Comment:         comment.Comment,
			ParentCommentID: comment.ParentCommentID,
			Rating:          comment.Rating,
		})
	}
	return response, nil
}
