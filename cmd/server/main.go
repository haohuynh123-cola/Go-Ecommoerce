package main

import (
	"log"
	"time"

	"haohuynh123-cola/ecommce/internal/platform/config"
	"haohuynh123-cola/ecommce/internal/platform/database"
	"haohuynh123-cola/ecommce/internal/platform/redisclient"
	"haohuynh123-cola/ecommce/internal/platform/server"
	"haohuynh123-cola/ecommce/internal/shared/middleware"

	_ "haohuynh123-cola/ecommce/docs"
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

	db, err := database.InitDatabase(&cfg.Database)
	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	redisClient, err := redisclient.InitRedis(&cfg.Redis)
	if err != nil {
		log.Fatal(err)
	}
	defer redisClient.Close()

	// Initialize Log system

	r := server.SetupRouter(db, redisClient, cfg) // Initialize routes

	//use rate limiter middleware for all routes,  1 minute 100 requests per minute
	globalLimit := middleware.NewRateLimiter(redisClient, 100, time.Minute)
	r.Use(globalLimit.Middleware("global"))

	// Start server on port 8080 (default)
	// Server will listen on 0.0.0.0:8080 (localhost:8080 on Windows)
	if err := r.Run(); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
