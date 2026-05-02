package authdto

// DTO Login
type RequestLogin struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type ResponseLogin struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Token string `json:"token"`
}

type RequestGoogleLogin struct {
	IDToken string `json:"id_token" binding:"required"`
}

//DTO Register

type RequestRegister struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	Name     string `json:"name" binding:"required"`
}
type RequestVerifyOTP struct {
	Email string `json:"email" binding:"required,email"`
	OTP   string `json:"otp" binding:"required"`
}

type ResponseRegister struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// DTO Resend OTP
type RequestResendOTP struct {
	Email string `json:"email" binding:"required,email"`
}

// DTO Me
type ResponseMe struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}
