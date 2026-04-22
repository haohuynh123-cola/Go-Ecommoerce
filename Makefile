ROOT=./cmd/server
GOOSE = goose -dir migrations mysql "sunny:123456@tcp(localhost:3306)/ecommerce"

run:
	go run $(ROOT)

migrate-up:
	$(GOOSE) up

migrate-down:
	$(GOOSE) down

.PHONY: run migrate-up migrate-down