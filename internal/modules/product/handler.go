package product

import (
	"errors"
	"net/http"
	"strconv"

	productdto "haohuynh123-cola/ecommce/internal/modules/product/dto"
	"haohuynh123-cola/ecommce/internal/shared/errs"
	"haohuynh123-cola/ecommce/internal/shared/response"

	"github.com/bytedance/gopkg/util/logger"
	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	productService ProductService
}

func NewProductHandler(productService ProductService) *ProductHandler {
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

// GetProducts handles requests to retrieve a list of products
// @Summary      List products
// @Description  Retrieve a paginated list of products with optional filtering by name and SKU
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        name      query     string  false  "Filter by product name"
// @Param        sku       query     string  false  "Filter by product SKU"
// @Param        page      query     int     false  "Page number (default: 1)"
// @Param        page_size query     int     false  "Number of items per page (default: 10)"
// @Success      200       {object}  response.PaginatedSuccessResponseSwag
// @Failure      400       {object}  response.ErrorResponseSwag
// @Failure      500       {object}  response.ErrorResponseSwag
// @Router       /products [get]
func (h *ProductHandler) GetProducts(c *gin.Context) {
	// Implement logic to get all products
	var req productdto.ProductFilter

	if err := c.ShouldBindQuery(&req); err != nil {
		logger.Errorf("failed to bind query parameters: %v", err)
		c.JSON(http.StatusBadRequest, response.ErrorResponse(errs.ErrCodeInvalidRequest, "invalid query parameters"))
		return
	}

	products, totalItems, err := h.productService.ListProducts(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeNotFound, "failed to get products"))
		return
	}

	c.JSON(http.StatusOK, response.PaginatedSuccessResponse(products, req.Page, req.PageSize, totalItems))
}

func (h *ProductHandler) GetProductByID(c *gin.Context) {
	// Implement logic to get a product by ID
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)

	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse(errs.ErrCodeInvalidRequest, "invalid product ID"))
		return
	}

	product, err := h.productService.GetProductByID(c.Request.Context(), int64(id))
	if err != nil {
		if err == errs.ErrProductNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse(errs.ErrCodeProductNotFound, "product not found"))
			return
		}
		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, "failed to get product"))
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse(product))
}

// CreateProduct handles requests to create a new product
// @Summary      Create product
// @Description  Create a new product with the provided details
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        createProductRequest  body      productdto.CreateProductRequest  true  "Create product request"
// @Success      201  {object}  response.SuccessResponseSwag{data=product.Product}
// @Failure      400  {object}  response.ErrorResponseSwag
// @Failure      409  {object}  response.ErrorResponseSwag
// @Failure      500  {object}  response.ErrorResponseSwag
// @Router       /products [post]
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var req productdto.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse(errs.ErrCodeInvalidRequest, "invalid request"))
		return
	}

	createdProduct, err := h.productService.CreateProduct(c.Request.Context(), &req)

	if err != nil {
		if err == errs.ErrSKUAlreadyExists {
			c.JSON(http.StatusConflict, response.ErrorResponse(errs.ErrCodeSKUAlreadyExists, "SKU already exists"))
			return
		}
		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, "failed to create product"))
		return
	}

	c.JSON(http.StatusCreated, response.SuccessResponse(createdProduct))
}

// UpdateProduct handles requests to update an existing product
// @Summary      Update product
// @Description  Update the details of an existing product by ID
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        id                    path      int64                            true  "Product ID"
// @Param        updateProductRequest   body      productdto.UpdateProductRequest  true  "Update product request"
// @Success      200                   {object}  response.SuccessResponseSwag{data=product.Product}
// @Failure      400                   {object}  response.ErrorResponseSwag
// @Failure      404                   {object}  response.ErrorResponseSwag
// @Failure      409                   {object}  response.ErrorResponseSwag
// @Failure      500                   {object}  response.ErrorResponseSwag
// @Router       /products/{id} [put]
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	// Implement logic to update an existing product
	var req productdto.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse(errs.ErrCodeInvalidRequest, "invalid request"))
		return
	}

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)

	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse(errs.ErrCodeInvalidRequest, "invalid product ID"))
		return
	}

	updatedProduct, err := h.productService.UpdateProduct(c.Request.Context(), int64(id), &req)
	if err != nil {
		if err == errs.ErrProductNotFound {
			c.JSON(http.StatusNotFound, response.ErrorResponse(errs.ErrCodeProductNotFound, "product not found"))
			return
		}
		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, "failed to update product"))
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse(updatedProduct))
}

// DeleteProduct handles requests to delete a product by ID
// @Summary      Delete product
// @Description  Delete an existing product by ID
// @Tags         Products
// @Accept       json
// @Produce      json
// @Param        id  path      int64  true  "Product ID"
// @Success      200 {object}  response.SuccessResponseSwag
// @Failure      400 {object}  response.ErrorResponseSwag
// @Failure      404 {object}  response.ErrorResponseSwag
// @Failure      500 {object}  response.ErrorResponseSwag
// @Router       /products/{id} [delete]
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	// Implement logic to delete a product
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)

	if err != nil {
		c.JSON(http.StatusBadRequest, response.ErrorResponse(errs.ErrCodeInvalidRequest, "invalid product ID"))
		return
	}

	_, err = h.productService.DeleteProduct(c.Request.Context(), int64(id))
	if err != nil {
		if errors.Is(err, errs.ErrProductNotFound) {
			c.JSON(http.StatusNotFound, response.ErrorResponse(errs.ErrCodeProductNotFound, "product not found"))
			return
		}
		c.JSON(http.StatusInternalServerError, response.ErrorResponse(errs.ErrCodeInternal, "failed to delete product"))
		return
	}

	c.JSON(http.StatusOK, response.SuccessResponse(nil))
}
