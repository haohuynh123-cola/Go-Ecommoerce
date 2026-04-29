# Go-Ecommoerce

Go-Ecommoerce is a RESTful e-commerce backend built with **Go** and **Gin**. The project currently includes **JWT authentication**, **product management**, **cart operations**, **order processing**, **Redis caching**, **rate limiting**, and **Swagger API documentation**.

## 1. Features

- User registration, login, and current-user profile
- Product CRUD operations
- Product listing with filtering and pagination
- Add to cart, list cart items, and update cart quantity
- Create orders from product items
- Get user orders and order details
- Redis-based caching for product lists and cart data
- Sliding-window rate limiting per IP
- Swagger UI for API discovery

## 2. Tech Stack

| Category | Technology |
| --- | --- |
| Language | Go 1.26.1 |
| HTTP framework | Gin |
| Configuration | Viper |
| Database | MySQL 8 |
| Database access | sqlx, go-sql-driver/mysql |
| Cache / rate limit | Redis, go-redis/v9 |
| Authentication | JWT v5 |
| Validation | go-playground/validator/v10 |
| API documentation | swag, gin-swagger, swagger files |
| Migrations | Goose |
| Containers | Docker, Docker Compose |

## 3. Source Structure

The project follows a **modular monolith** layout. Each business domain
(`auth`, `product`, `cart`, `order`) is self-contained under
`internal/modules/`, with cross-cutting concerns split into `shared/`
(reusable building blocks) and `platform/` (infrastructure adapters).

```text
ecommce/
├── Dockerfile
├── Makefile
├── README.md
├── docker-compose.yaml
├── go.mod
├── go.sum
├── cmd/
│   └── server/                 # application entrypoint (main.go)
├── docs/                       # generated Swagger files (swag init output)
│   ├── docs.go
│   ├── swagger.json
│   └── swagger.yaml
├── http/                       # ready-to-use HTTP request examples
│   ├── auth.http
│   ├── cart.http
│   ├── order.http
│   └── product.http
├── internal/
│   ├── di/                     # Wire DI: aggregates module WireSets
│   │   ├── wire.go
│   │   └── wire_gen.go
│   ├── modules/                # one self-contained package per domain
│   │   ├── auth/
│   │   │   ├── handler.go
│   │   │   ├── service.go
│   │   │   ├── repository.go
│   │   │   ├── cache.go
│   │   │   ├── domain.go
│   │   │   ├── wire.go
│   │   │   └── dto/
│   │   │       └── dto.go      # package authdto
│   │   ├── product/
│   │   │   ├── handler.go
│   │   │   ├── service.go
│   │   │   ├── repository.go
│   │   │   ├── cache.go
│   │   │   ├── domain.go
│   │   │   ├── wire.go
│   │   │   └── dto/
│   │   │       └── dto.go      # package productdto
│   │   ├── cart/
│   │   │   ├── handler.go
│   │   │   ├── service.go
│   │   │   ├── repository.go
│   │   │   ├── cache.go
│   │   │   ├── domain.go
│   │   │   ├── wire.go
│   │   │   └── dto/
│   │   │       └── dto.go      # package cartdto
│   │   └── order/
│   │       ├── handler.go
│   │       ├── service.go
│   │       ├── repository.go
│   │       ├── item_repository.go
│   │       ├── activity_repository.go
│   │       ├── cache.go
│   │       ├── domain.go
│   │       ├── wire.go
│   │       └── dto/
│   │           └── dto.go      # package orderdto
│   ├── platform/               # infrastructure / external adapters
│   │   ├── config/             # Viper config + config.yaml
│   │   │   ├── config.go
│   │   │   ├── config.yaml
│   │   │   └── config.example.yaml
│   │   ├── database/           # MySQL initialization (sqlx)
│   │   │   └── mysql.go
│   │   ├── redisclient/        # Redis client initialization
│   │   │   └── redis.go
│   │   ├── logger/             # logger setup
│   │   │   └── logger.go
│   │   └── server/             # Gin engine + module route registration
│   │       └── router.go
│   └── shared/                 # cross-cutting helpers
│       ├── crypto/             # JWT, bcrypt, OTP generation
│       ├── errs/               # sentinel errors and error codes
│       ├── helper/             # pagination + small utilities
│       ├── mailer/             # SMTP email sender
│       ├── middleware/         # auth middleware + rate limiter
│       └── response/           # API response envelope (success/error/paginated)
├── migrations/                 # Goose SQL migrations
│   ├── 20260422064943_create_urse_table.sql
│   ├── 20260423063902_add_table_products.sql
│   ├── 20260424140508_create_table_carts.sql
│   ├── 20260426035554_createa_table_orders.sql
│   ├── 20260426035936_createa_table_order_items.sql
│   ├── 20260427072101_create_table_order_activities.sql
│   └── 20260428163109_add_column_verify_to_users_table.sql
└── web/                        # frontend (Vite)
```

### Layer roles

- **`cmd/server/`**: application entrypoint. Loads config, initializes
  MySQL/Redis, wires the router, starts the HTTP server.
- **`internal/modules/<domain>/`**: each domain owns its own handler,
  service, repository, cache, domain types, DTOs, and Wire set. Modules
  do not depend on each other except via interfaces (e.g. `order` depends
  on `product.ProductRepository`).
- **`internal/modules/<domain>/dto/`** (`authdto`, `productdto`,
  `cartdto`, `orderdto`): request/response DTOs kept in a sub-package so
  that DTO and domain types with the same name (e.g. `Product`) do not
  collide.
- **`internal/shared/`**: language- and framework-level helpers reused by
  every module — error sentinels, response envelope, JWT/bcrypt, mailer,
  middleware, and small utilities.
- **`internal/platform/`**: adapters to external systems (MySQL, Redis,
  config, logger) and the HTTP server bootstrap.
- **`internal/di/`**: Wire-based dependency injection. Aggregates each
  module's `WireSet` into `InitializeXxxHandler` constructors that
  `internal/platform/server` calls during route registration.
- **`docs/`**: Swagger artifacts produced by `swag init`.
- **`migrations/`**: schema versioning via Goose.
- **`http/`**: example HTTP requests for manual testing.

## 4. System Components

### Database tables

The current schema includes:

- `users`
- `products`
- `carts`
- `orders`
- `order_items`

### Middleware

- **Auth middleware** for protected routes
- **Rate limiter** with a default limit of **100 requests per minute per IP**

### Cache

- Product list cache
- Cart cache by `user_id`

## 5. Configuration

The application loads config from:

`internal/platform/config/config.yaml`

Current example:

```yaml
server:
  port: 8080
  host: localhost

database:
  host: localhost
  port: 3306
  user: sunny
  password: "123456"
  database_name: ecommerce

redis:
  host: localhost
  port: 6379
  password: ""
  db: 0

jwt:
  secret_key: "haohuynh19123131312312312"
```

> Change the database password and JWT secret before using this project in a real environment.

## 6. Running the Project

### Run with Docker Compose

```bash
docker compose up --build -d
```

Defined services:

- `app`: API server on port `8080`
- `mysql`: MySQL on port `3306`
- `redis`: Redis on port `6379`

### Run locally

1. Install dependencies:

```bash
go mod tidy
```

2. Start MySQL and Redis:

```bash
docker compose up -d mysql redis
```

3. Run database migrations:

```bash
make migrate-up
```

4. Start the server:

```bash
make run
```

## 7. Makefile Commands

```bash
make run           # run the server
make dev           # docker compose up -d
make setup         # go mod tidy
make migrate-up    # run goose up
make migrate-down  # rollback migrations
make build         # build docker image
make swag          # generate Swagger docs into ./docs
make wire          # regenerate internal/di/wire_gen.go from WireSets
```

## 8. Swagger

After the server starts, open:

`http://localhost:8080/swagger/index.html`

API base path:

`/api/v1`

## 9. Response Format

### Success

```json
{
  "status": "success",
  "data": {}
}
```

### Error

```json
{
  "status": "error",
  "code": "validation_error",
  "message": "validation failed",
  "errors": {
    "Email": "invalid email format"
  }
}
```

### Paginated response

```json
{
  "status": "success",
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 10,
    "total_items": 100,
    "total_pages": 10
  }
}
```

## 10. Authentication

Current auth flow:

1. Call `POST /api/v1/auth/register`
2. Call `POST /api/v1/auth/login` to get a token
3. Send the token in the `Authorization` header for protected routes

> Note: the current middleware reads the raw token value directly from the `Authorization` header. Use:
>
> `Authorization: <jwt-token>`
>
> instead of:
>
> `Authorization: Bearer <jwt-token>`

## 11. API Usage Guide

### 11.1. Auth API

#### Register

**POST** `/api/v1/auth/register`

Request body:

```json
{
  "email": "user@example.com",
  "password": "123456",
  "name": "Sunny"
}
```

#### Login

**POST** `/api/v1/auth/login`

Request body:

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

Response data:

```json
{
  "id": 1,
  "name": "Sunny",
  "email": "user@example.com",
  "token": "jwt-token"
}
```

#### Get current user

**GET** `/api/v1/auth/me`

Header:

```http
Authorization: <jwt-token>
```

---

### 11.2. Product API

#### List products

**GET** `/api/v1/products/`

Query parameters:

- `name`: filter by product name
- `sku`: filter by SKU
- `page`: page number, default `1`
- `page_size`: items per page, default `10`

Example:

```bash
curl "http://localhost:8080/api/v1/products/?page=1&page_size=10&name=shirt"
```

#### Get product by ID

**GET** `/api/v1/products/:id`

#### Create product

**POST** `/api/v1/products/`

Request body:

```json
{
  "name": "T-Shirt",
  "description": "Cotton t-shirt",
  "sku": "TS-001",
  "price": 199000,
  "stock": 50
}
```

#### Update product

**PUT** `/api/v1/products/:id`

Request body:

```json
{
  "name": "T-Shirt Premium",
  "description": "Updated description",
  "sku": "TS-001",
  "price": 249000,
  "stock": 40
}
```

#### Delete product

**DELETE** `/api/v1/products/:id`

> Product routes are currently public and are not protected by auth middleware.

---

### 11.3. Cart API

All cart routes require authentication.

#### Add to cart

**POST** `/api/v1/cart/add`

Header:

```http
Authorization: <jwt-token>
```

Request body:

```json
{
  "product_id": 1,
  "quantity": 2
}
```

#### Get cart items

**GET** `/api/v1/cart/items`

#### Update cart item

**PUT** `/api/v1/cart/update`

Request body:

```json
{
  "product_id": 1,
  "quantity": 3
}
```

#### Remove item from cart

**DELETE** `/api/v1/cart/remove`

#### Clear cart

**DELETE** `/api/v1/cart/clear`

> `remove` and `clear` routes are registered, but their handlers are not implemented yet.

---

### 11.4. Order API

All order routes require authentication.

#### Create order

**POST** `/api/v1/orders/`

Header:

```http
Authorization: <jwt-token>
```

Request body:

```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 2,
      "quantity": 1
    }
  ]
}
```

> `price` is loaded from the database in the service layer, so the client does not need to send it.

#### Get current user's orders

**GET** `/api/v1/orders/`

#### Get order detail

**GET** `/api/v1/orders/:id`

## 12. Quick curl Examples

### Register

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "123456",
    "name": "Sunny"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "123456"
  }'
```

### Get current user

```bash
curl http://localhost:8080/api/v1/auth/me \
  -H "Authorization: <jwt-token>"
```

### Create product

```bash
curl -X POST http://localhost:8080/api/v1/products/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "T-Shirt",
    "description": "Cotton t-shirt",
    "sku": "TS-001",
    "price": 199000,
    "stock": 50
  }'
```

### Add to cart

```bash
curl -X POST http://localhost:8080/api/v1/cart/add \
  -H "Authorization: <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "quantity": 2
  }'
```

### Create order

```bash
curl -X POST http://localhost:8080/api/v1/orders/ \
  -H "Authorization: <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "product_id": 1, "quantity": 2 },
      { "product_id": 2, "quantity": 1 }
    ]
  }'
```

## 13. Current Codebase Notes

- Product API already supports full CRUD
- Auth API is working for `register`, `login`, and `me`
- Cart API currently implements `add`, `items`, and `update`
- `cart/remove` and `cart/clear` are not implemented yet
- Product create/update/delete routes are not protected
- Swagger is available for quick API inspection at runtime
