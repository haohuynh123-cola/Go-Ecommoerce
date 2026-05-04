package comment

import (
	"context"
	commentdto "haohuynh123-cola/ecommce/internal/modules/comment/dto"
	"haohuynh123-cola/ecommce/internal/shared/errs"
	"haohuynh123-cola/ecommce/internal/shared/response"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type CommentHandler struct {
	service CommentService
}

func NewCommentHandler(service CommentService) *CommentHandler {
	return &CommentHandler{service: service}
}

func (h *CommentHandler) RegisterRoutes(r *gin.Engine) {
	commentGroup := r.Group("/api/v1/comments")
	{
		commentGroup.POST("/", h.CreateComment)
		commentGroup.GET("/product/:product_id/comments", h.GetCommentsByProductID)
	}
}

func (h *CommentHandler) CreateComment(c *gin.Context) {
	var req commentdto.CreateComment
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ValidationError(err))
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()

	comment, err := h.service.CreateComment(ctx, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse(comment))
}

func (h *CommentHandler) GetCommentsByProductID(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("product_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ValidationError(err))
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()

	comments, err := h.service.GetCommentsByProductID(ctx, int64(productID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse(comments))
}
