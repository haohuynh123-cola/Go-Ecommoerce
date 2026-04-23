package domain

import "errors"

var (
	ErrUnauthorized           = errors.New("unauthorized")
	ErrForbidden              = errors.New("forbidden")
	ErrEmailAlreadyExists     = errors.New("email already exists")
	ErrInvalidCredentials     = errors.New("invalid credentials")
	ErrUserNotFound           = errors.New("user not found")
	ErrTokenInvalid           = errors.New("invalid token")
	ErrCodeInternal           = "internal_error"
	ErrCodeUnauthorized       = "unauthorized"
	ErrCodeEmailAlreadyExists = "email_already_exists"
	ErrCodeValidation         = "validation_error"
	ErrCodeNotFound           = "not_found"

)
