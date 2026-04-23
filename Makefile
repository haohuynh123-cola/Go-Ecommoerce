ROOT=./cmd/server
GOOSE = goose -dir migrations mysql "sunny:123456@tcp(localhost:3306)/ecommerce"

run:
	go run $(ROOT)

setup:
	go mod tidy

migrate-up:
	$(GOOSE) up

migrate-down:
	$(GOOSE) down

build:
	docker compose build .

.PHONY: run migrate-up migrate-down setup build