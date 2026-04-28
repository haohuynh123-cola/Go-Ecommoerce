package crypto

import (
	"math/rand"

	"golang.org/x/crypto/bcrypt"
)

// HashPassword hashes a plaintext password using bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// CheckPasswordHash compares a plaintext password with a hashed password
func CheckPasswordHash(password, hash string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}

// GenerateOTP generates a random 6-digit OTP
func GenerateOTP() string {
	// Generate a random 6-digit OTP
	otp := ""
	for i := 0; i < 6; i++ {
		otp += string('0' + byte(rand.Intn(10)))
	}
	return otp
}
