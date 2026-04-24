# Go Ecommerce Project – Phases & Architecture

## Mục tiêu dự án

Xây dựng backend ecommerce bằng Go

---

# Tech Stack

- Go
- Gin
- Mysql
- Redis
- Docker Compose
- JWT Auth
- Swagger

---

# Cấu trúc thư mục đề xuất

```text
cmd/server/main.go
internal/
  domain/
  dto/
  handler/
  service/
  repository/
  middleware/
  config/
  worker/
pkg/
```

---

# Giải thích kiến trúc

## domain/

Business entities và rules.

- product.go
- order.go
- cart.go
- user.go

## dto/

Request / Response JSON.

- login_request.go
- create_product_request.go
- checkout_request.go

## handler/

HTTP handlers.

## service/

Business use cases.

## repository/

Database access.

## worker/

Background jobs: send email, async tasks.

---

# PHASE 1 – Foundation (Week 1)

## Goal

Project chạy được + auth cơ bản.

## Tasks

- Init Go module -> xong
- Setup Gin router -> xong
- Connect Mysql -> xong
- ENV config -> xong
- Migration users table -> xong
- Register API -> xong
- Login API -> xong
- JWT middleware -> xong
- Get profile API -> xong

## Deliverable

User có thể đăng ký / đăng nhập.

---

# PHASE 2 – Product Module (Week 2)

## Goal

Quản lý sản phẩm.

## Tasks

- products table
- Admin create product
- Update product
- Delete product
- Product detail
- Product listing
- Search product
- Pagination

## Deliverable

Catalog sản phẩm hoàn chỉnh.

---

# PHASE 3 – Cart Module (Week 3)

## Goal

Giỏ hàng.

## Tasks

- carts table
- cart_items table
- Add item to cart
- Update quantity
- Remove item
- View cart
- Calculate subtotal

## Deliverable

User có thể mua hàng.

---

# PHASE 4 – Checkout / Order (Week 4)

## Goal

Flow đặt hàng thật.

## Tasks

- orders table
- order_items table
- Checkout API
- DB transaction
- Reduce stock
- Prevent oversell
- Order history
- Order detail

## Deliverable

Flow mua hàng hoàn chỉnh.

---

# PHASE 5 – Upgrade Profile (Week 5)

## Goal

Tăng giá trị CV.

## Tasks

- Redis cache products
- Invalidate cache
- Logging middleware
- Error handling chuẩn
- Unit tests
- Swagger docs

## Deliverable

Project chuyên nghiệp hơn.

---

# PHASE 6 – Production Style (Week 6)

## Goal

Thể hiện senior mindset.

## Tasks

- Docker Compose
- Background worker gửi email order confirm
- Graceful shutdown
- Context timeout
- CI/CD GitHub Actions
- Deploy VPS / Railway / Render

## Deliverable

Project deploy public.

---

# Domain Models Gợi ý

## Product

- ID
  n- Name
- Price
- Stock
- Status

## Cart

- UserID
- Items[]

## Order

- ID
- UserID
- TotalAmount
- Status
- Items[]

---

# API Summary

## Auth

- POST /register
- POST /login
- GET /me

## Products

- GET /products
- GET /products/:id
- POST /admin/products
- PUT /admin/products/:id
- DELETE /admin/products/:id

## Cart

- GET /cart
- POST /cart/items
- PUT /cart/items/:id
- DELETE /cart/items/:id

## Orders

- POST /checkout
- GET /orders
- GET /orders/:id

---

# Nếu Phỏng Vấn Hãy Nói

- Tôi dùng transaction để tránh oversell stock.
- Tôi dùng Redis để giảm load listing.
- Tôi tách handler/service/repository để maintain dễ.
- Tôi dùng worker để gửi email async.
- Tôi deploy bằng Docker Compose.

---

# Rule Quan Trọng

- Hoàn thành từng phase.
- Không tối ưu quá sớm.
- Mỗi phase push GitHub.
- Viết README rõ ràng.
- Focus shipping.

---
