package handler

import (
	"github.com/gin-gonic/gin"
)

// SetupRouter initializes the Gin router and registers all routes
func SetupRouter() *gin.Engine {
	r := gin.Default()

	return r
}
