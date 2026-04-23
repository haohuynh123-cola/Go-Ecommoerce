package middleware

import (
	"haohuynh123-cola/ecommce/internal/config"
	"haohuynh123-cola/ecommce/internal/crypto"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware(cfg *config.JWTConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Implement authentication logic here, such as checking for a valid JWT token
		token := c.GetHeader("Authorization")
		if token == "" {
			c.AbortWithStatusJSON(401, gin.H{"error": "Authorization header is missing"})
			return
		}
		parsedToken, err := crypto.ValidateJWT(token, cfg.SecretKey)
		if err != nil {
			c.JSON(401, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}

		claims := parsedToken.Claims.(jwt.MapClaims)
		c.Set("user_id", int64(claims["user_id"].(float64)))

		c.Next()
	}
}
