package main

import (
	"haohuynh123-cola/ecommce/internal/cache"
	"haohuynh123-cola/ecommce/internal/config"
	"haohuynh123-cola/ecommce/internal/handler"
	"haohuynh123-cola/ecommce/internal/initialize"
	"haohuynh123-cola/ecommce/internal/repo"
	"haohuynh123-cola/ecommce/internal/service"
	"log"
	"time"
)

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

	// Start server on port 8080 (default)
	// Server will listen on 0.0.0.0:8080 (localhost:8080 on Windows)
	if err := r.Run(); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
