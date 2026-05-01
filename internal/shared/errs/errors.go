package errs

import "errors"

var (
	ErrUnauthorized         = errors.New("unauthorized")
	ErrForbidden            = errors.New("forbidden")
	ErrEmailAlreadyExists   = errors.New("email already exists")
	ErrInvalidCredentials   = errors.New("invalid credentials")
	ErrUserNotFound         = errors.New("user not found")
	ErrTokenInvalid         = errors.New("invalid token")
	ErrSKUAlreadyExists     = errors.New("SKU already exists")
	ErrProductNotFound      = errors.New("product not found")
	ErrOrderNotFound        = errors.New("order not found")
	ErrCartItemNotFound     = errors.New("cart item not found")
	ErrInvalidOrderStatus   = errors.New("invalid order status")
	ErrInvalidOTP           = errors.New("invalid OTP")
	ErrOTPExpired           = errors.New("OTP expired")
	ErrEmailNotFound        = errors.New("email not found")
	ErrEmailNotVerified     = errors.New("email not verified")
	ErrEmailAlreadyVerified = errors.New("email already verified")

	ErrCodeInternal           = "internal_error"
	ErrCodeUnauthorized       = "unauthorized"
	ErrCodeEmailAlreadyExists = "email_already_exists"
	ErrCodeValidation         = "validation_error"
	ErrCodeNotFound           = "not_found"
	ErrCodeInvalidRequest     = "invalid_request"
	ErrCodeSKUAlreadyExists   = "sku_already_exists"
	ErrCodeProductNotFound    = "product_not_found"
	ErrCodeOrderNotFound      = "order_not_found"
	ErrCodeEmailNotFound      = "email_not_found"
	ErrCodeInvalidOTP         = "invalid_otp"
	ErrCodeEmailNotVerified   = "email_not_verified"
)
