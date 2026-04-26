package main

import (
	"haohuynh123-cola/ecommce/internal/cache"
	"haohuynh123-cola/ecommce/internal/config"
	"haohuynh123-cola/ecommce/internal/handler"
	"haohuynh123-cola/ecommce/internal/initialize"
	"haohuynh123-cola/ecommce/internal/middleware"
	"haohuynh123-cola/ecommce/internal/repo"
	"haohuynh123-cola/ecommce/internal/service"
	"log"
	"time"

	_ "haohuynh123-cola/ecommce/internal/docs"
)

// @title           E-commerce API
// @version         1.0
// @description     API cho hệ thống e-commerce
// @termsOfService  http://example.com/terms/

// @contact.name   API Support
// @contact.email  support@example.com

// @host      localhost:8080
// @BasePath  /api/v1

// @securityDefinitions.apikey BearerAuth
// @in                         header
// @name                       Authorization
// @description                Type "Bearer" followed by a space and JWT token.
func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}

	db, err := initialize.InitDatabase(&cfg.Database)
	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	redisClient, err := initialize.InitRedis(&cfg.Redis)
	if err != nil {
		log.Fatal(err)
	}
	defer redisClient.Close()

	r := handler.SetupRouter() // Initialize routes
	//use rate limiter middleware for all routes,  1 minute 100 requests per minute
	globalLimit := middleware.NewRateLimiter(redisClient, 100, time.Minute)
	r.Use(globalLimit.Middleware("global"))

	// Register authentication routes
	userRepo := repo.NewUserRepository(db)
	authService := service.NewAuthService(userRepo, cfg.JWT.SecretKey)
	authHandler := handler.NewAuthHandler(authService, cfg.JWT)
	authHandler.RegisterRoutes(r)

	// Register product routes
	productRepo := repo.NewProductRepository(db)
	productCache := cache.NewProductCache(redisClient, 5*time.Minute)
	productService := service.NewProductService(productRepo, productCache)
	productHandler := handler.NewProductHandler(productService)
	productHandler.RegisterRoutes(r)

	//Register Cart routes
	cartRepo := repo.NewCartRepository(db)
	cartCache := cache.NewCartCache(redisClient, 30*time.Minute)
	cartService := service.NewCartService(cartRepo, cartCache)
	cartHandler := handler.NewCartHandler(cartService, cfg.JWT)
	cartHandler.RegisterRoutes(r)

	// Register order routes
	orderRepo := repo.NewOrderRepository(db)
	orderService := service.NewOrderService(orderRepo, productRepo)
	orderHandler := handler.NewOrderHandler(orderService, cfg.JWT)
	orderHandler.RegisterOrderRoutes(r)

	// Start server on port 8080 (default)
	// Server will listen on 0.0.0.0:8080 (localhost:8080 on Windows)
	if err := r.Run(); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
