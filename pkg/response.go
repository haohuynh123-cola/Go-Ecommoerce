// pkg/response.go
package pkg

import (
	"errors"
	"haohuynh123-cola/ecommce/internal/domain"

	"github.com/go-playground/validator/v10"
)

type Response struct {
	Status  string      `json:"status"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Code    string      `json:"code,omitempty"`
	Errors  interface{} `json:"errors,omitempty"`
}

func SuccessResponse(data interface{}) Response {
	return Response{
		Status: "success",
		Data:   data,
	}
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
			Code:    domain.ErrCodeValidation,
			Message: "validation failed",
			Errors:  fields,
		}
	}
	return ErrorResponse(domain.ErrCodeValidation, err.Error())
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
