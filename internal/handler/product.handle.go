package handler

import (
	"haohuynh123-cola/ecommce/internal/domain"
	"haohuynh123-cola/ecommce/internal/dto"
	"haohuynh123-cola/ecommce/pkg"
	"net/http"
	"strconv"

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
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	products, totalItems, err := h.productService.ListProducts(c.Request.Context(), page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, pkg.ErrorResponse(domain.ErrCodeNotFound, "failed to get products"))
		return
	}

	c.JSON(http.StatusOK, pkg.PaginatedSuccessResponse(products, page, pageSize, totalItems))
}

func (h *ProductHandler) GetProductByID(c *gin.Context) {
	// Implement logic to get a product by ID
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)

	if err != nil {
		c.JSON(http.StatusBadRequest, pkg.ErrorResponse(domain.ErrCodeInvalidRequest, "invalid product ID"))
		return
	}

	product, err := h.productService.GetProductByID(c.Request.Context(), int64(id))
	if err != nil {
		if err == domain.ErrProductNotFound {
			c.JSON(http.StatusNotFound, pkg.ErrorResponse(domain.ErrCodeProductNotFound, "product not found"))
			return
		}
		c.JSON(http.StatusInternalServerError, pkg.ErrorResponse(domain.ErrCodeInternal, "failed to get product"))
		return
	}

	c.JSON(http.StatusOK, pkg.SuccessResponse(product))
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
	var req dto.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, pkg.ErrorResponse(domain.ErrCodeInvalidRequest, "invalid request"))
		return
	}

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)

	if err != nil {
		c.JSON(http.StatusBadRequest, pkg.ErrorResponse(domain.ErrCodeInvalidRequest, "invalid product ID"))
		return
	}

	updatedProduct, err := h.productService.UpdateProduct(c.Request.Context(), int64(id), &req)
	if err != nil {
		if err == domain.ErrProductNotFound {
			c.JSON(http.StatusNotFound, pkg.ErrorResponse(domain.ErrCodeProductNotFound, "product not found"))
			return
		}
		c.JSON(http.StatusInternalServerError, pkg.ErrorResponse(domain.ErrCodeInternal, "failed to update product"))
		return
	}

	c.JSON(http.StatusOK, pkg.SuccessResponse(updatedProduct))
}

func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	// Implement logic to delete a product
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)

	if err != nil {
		c.JSON(http.StatusBadRequest, pkg.ErrorResponse(domain.ErrCodeInvalidRequest, "invalid product ID"))
		return
	}

	err = h.productService.DeleteProduct(c.Request.Context(), int64(id))
	if err != nil {
		if err == domain.ErrProductNotFound {
			c.JSON(http.StatusNotFound, pkg.ErrorResponse(domain.ErrCodeProductNotFound, "product not found"))
			return
		}
		c.JSON(http.StatusInternalServerError, pkg.ErrorResponse(domain.ErrCodeInternal, "failed to delete product"))
		return
	}

	c.JSON(http.StatusOK, pkg.SuccessResponse(nil))
}
