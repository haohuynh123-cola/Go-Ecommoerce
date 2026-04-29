// internal/shared/response/response.go
package response

import (
	"errors"
	"haohuynh123-cola/ecommce/internal/shared/errs"

	"github.com/go-playground/validator/v10"
)

type Response struct {
	Status  string      `json:"status"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Code    string      `json:"code,omitempty"`
	Errors  interface{} `json:"errors,omitempty"`
}

type PaginatedResponse struct {
	Status     string          `json:"status"`
	Message    string          `json:"message,omitempty"`
	Data       any             `json:"data,omitempty"`
	Code       string          `json:"code,omitempty"`
	Errors     any             `json:"errors,omitempty"`
	Pagination *PaginationMeta `json:"pagination,omitempty"`
}

func SuccessResponse(data any) Response {
	return Response{
		Status: "success",
		Data:   data,
	}
}

type ErrorResponseSwag struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Code    string `json:"code,omitempty"`
}

type SuccessResponseSwag struct {
	Status  string `json:"status"`
	Message string `json:"message,omitempty"`
	Data    any    `json:"data,omitempty"`
}

type PaginatedSuccessResponseSwag struct {
	Status     string          `json:"status"`
	Data       any             `json:"data"`
	Pagination *PaginationMeta `json:"pagination"`
}

type PaginationMeta struct {
	Page       int   `json:"page"`
	PageSize   int   `json:"page_size"`
	TotalItems int64 `json:"total_items"`
	TotalPages int   `json:"total_pages"`
}

func ErrorResponse(code string, message string) Response {
	return Response{
		Status:  "error",
		Code:    code,
		Message: message,
	}
}

func ValidationError(err error) Response {
	var ve validator.ValidationErrors
	if errors.As(err, &ve) {
		fields := make(map[string]string)
		for _, e := range ve {
			fields[e.Field()] = msgForTag(e.Tag())
		}
		return Response{
			Status:  "error",
			Code:    errs.ErrCodeValidation,
			Message: "validation failed",
			Errors:  fields,
		}
	}
	return ErrorResponse(errs.ErrCodeValidation, err.Error())
}

func msgForTag(tag string) string {
	switch tag {
	case "required":
		return "field is required"
	case "email":
		return "invalid email format"
	case "min":
		return "value is too short"
	case "max":
		return "value is too long"
	}
	return "invalid value"
}

func PaginatedSuccessResponse(data any, page, pageSize int, totalItems int64) PaginatedResponse {
	totalPages := int((totalItems + int64(pageSize) - 1) / int64(pageSize))
	return PaginatedResponse{
		Status: "success",
		Data:   data,
		Pagination: &PaginationMeta{
			Page:       page,
			PageSize:   pageSize,
			TotalItems: totalItems,
			TotalPages: totalPages,
		},
	}
}
