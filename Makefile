ROOT=./cmd/server
GOOSE = goose -dir migrations mysql "sunny:123456@tcp(localhost:3306)/ecommerce"

run:
	go run $(ROOT)

dev:
	docker compose up -d

setup:
	go mod tidy

migrate-up:
	$(GOOSE) up

migrate-down:
	$(GOOSE) down

build:
	docker compose build .

swag:
	swag init -g cmd/server/main.go  --parseInternal  -o docs

wire:
	cd internal/di && go run github.com/google/wire/cmd/wire

.PHONY: run migrate-up migrate-down setup build swag wire