package initialize

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"

	"haohuynh123-cola/ecommce/internal/config"
	"haohuynh123-cola/ecommce/internal/di"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

const productCacheTTL = 5 * time.Minute

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

	authHandler := di.InitializeAuthHandler(db, cfg.JWT)
	authHandler.RegisterRoutes(r)

	productHandler := di.InitializeProductHandler(db, rdb, productCacheTTL)
	productHandler.RegisterRoutes(r)

	cartHandler := di.InitializeCartHandler(db, rdb, productCacheTTL, cfg.JWT)
	cartHandler.RegisterRoutes(r)

	orderHandler := di.InitializeOrderHandler(db, rdb, productCacheTTL, cfg.JWT)
	orderHandler.RegisterRoutes(r)

	return r
}
