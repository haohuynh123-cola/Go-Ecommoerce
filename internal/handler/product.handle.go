package handler

import (
	"haohuynh123-cola/ecommce/internal/domain"
	"haohuynh123-cola/ecommce/internal/dto"
	"haohuynh123-cola/ecommce/pkg"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	productService domain.IProductService
}

func NewProductHandler(productService domain.IProductService) *ProductHandler {
	return &ProductHandler{productService: productService}
}

func (h *ProductHandler) RegisterRoutes(r *gin.Engine) {
	productGroup := r.Group("api/v1/products")
	productGroup.GET("/", h.GetProducts)
	productGroup.GET("/:id", h.GetProductByID)
	productGroup.POST("/", h.CreateProduct)
	productGroup.PUT("/:id", h.UpdateProduct)
	productGroup.DELETE("/:id", h.DeleteProduct)
}

func (h *ProductHandler) GetProducts(c *gin.Context) {
	// Implement logic to get all products
	products, err := h.productService.ListProducts(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, pkg.ErrorResponse(domain.ErrCodeNotFound, "failed to get products"))
		return
	}

	c.JSON(http.StatusOK, pkg.SuccessResponse(products))
}

func (h *ProductHandler) GetProductByID(c *gin.Context) {
	// Implement logic to get a product by ID
}

func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var req dto.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, pkg.ErrorResponse(domain.ErrCodeInvalidRequest, "invalid request"))
		return
	}

	createdProduct, err := h.productService.CreateProduct(c.Request.Context(), &req)

	if err != nil {
		if err == domain.ErrSKUAlreadyExists {
			c.JSON(http.StatusConflict, pkg.ErrorResponse(domain.ErrCodeSKUAlreadyExists, "SKU already exists"))
			return
		}
		c.JSON(http.StatusInternalServerError, pkg.ErrorResponse(domain.ErrCodeInternal, "failed to create product"))
		return
	}

	c.JSON(http.StatusCreated, pkg.SuccessResponse(createdProduct))
}

func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	// Implement logic to update an existing product
}

func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	// Implement logic to delete a product
}
