package main

import (
	"haohuynh123-cola/ecommce/internal/config"
	"haohuynh123-cola/ecommce/internal/handler"
	"haohuynh123-cola/ecommce/internal/repo"
	"haohuynh123-cola/ecommce/internal/service"
	"log"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}

	db, err := config.InitDatabase(&cfg.Database)
	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	r := handler.SetupRouter() // Initialize routes

	// Register authentication routes
	userRepo := repo.NewUserRepository(db)
	authService := service.NewAuthService(userRepo, cfg.JWT.SecretKey)
	authHandler := handler.NewAuthHandler(authService, cfg.JWT)
	authHandler.RegisterRoutes(r)

	// Start server on port 8080 (default)
	// Server will listen on 0.0.0.0:8080 (localhost:8080 on Windows)
	if err := r.Run(); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
