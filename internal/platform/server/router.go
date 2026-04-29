package server

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"

	"haohuynh123-cola/ecommce/internal/di"
	"haohuynh123-cola/ecommce/internal/platform/config"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

const (
	userCacheTTL    = 5 * time.Minute
	productCacheTTL = 5 * time.Minute
	cartCacheTTL    = 30 * time.Minute
	orderCacheTTL   = 30 * time.Minute
)

// SetupRouter initializes the Gin router and registers all routes
func SetupRouter(db *sqlx.DB, rdb *redis.Client, cfg *config.Config) *gin.Engine {
	if cfg.Server.Debug {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// CORS — allow Vite dev server (and common local origins) to call the API.
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://127.0.0.1:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	}))

	authHandler := di.InitializeAuthHandler(db, rdb, userCacheTTL, cfg.JWT, cfg.SMTP)
	authHandler.RegisterRoutes(r)

	productHandler := di.InitializeProductHandler(db, rdb, productCacheTTL)
	productHandler.RegisterRoutes(r)

	cartHandler := di.InitializeCartHandler(db, rdb, cartCacheTTL, cfg.JWT)
	cartHandler.RegisterRoutes(r)

	orderHandler := di.InitializeOrderHandler(db, rdb, orderCacheTTL, cfg.JWT)
	orderHandler.RegisterRoutes(r)

	return r
}
