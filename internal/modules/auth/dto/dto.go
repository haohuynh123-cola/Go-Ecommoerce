package authdto

type RequestLogin struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RequestRegister struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	Name     string `json:"name" binding:"required"`
}

type ResponseRegister struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type ResponseLogin struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Token string `json:"token"`
}

type ResponseMe struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type RequestVerifyOTP struct {
	Email string `json:"email" binding:"required,email"`
	OTP   string `json:"otp" binding:"required"`
}

type RequestResendOTP struct {
	Email string `json:"email" binding:"required,email"`
}

// RequestGoogleLogin carries the Google-issued ID token returned by Google
// Identity Services on the client. The backend validates this token against
// Google's tokeninfo endpoint and either signs an existing user in or
// provisions a new (already-verified) account.
type RequestGoogleLogin struct {
	IDToken string `json:"id_token" binding:"required"`
}
