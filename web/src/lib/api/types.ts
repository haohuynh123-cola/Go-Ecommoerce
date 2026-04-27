/** Shared API response types matching the Go backend envelope (pkg/response.go) */

export interface ApiSuccess<T> {
  status: 'success';
  data: T;
}

export interface ApiPaginated<T> {
  status: 'success';
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
}

export interface ApiError {
  status: 'error';
  code: string;
  message: string;
  errors?: Record<string, string>;
}

// ─── Auth ─────────────────────────────────────────────────────
/** POST /auth/register returns user info only — NO token. Redirect to /login after. */
export interface RegisterResponse {
  id: number;
  name: string;
  email: string;
}

/** POST /auth/login returns user info + JWT token. */
export interface LoginResponse {
  id: number;
  name: string;
  email: string;
  token: string;
}

/** GET /auth/me */
export interface MeResponse {
  id: number;
  name: string;
  email: string;
}

// ─── Product ──────────────────────────────────────────────────
/** domain.Product — no created_at / updated_at on the backend. */
export interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  price: number;
  stock: number;
}

export interface ProductFilters {
  name?: string;
  sku?: string;
  page?: number;
  page_size?: number;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  sku: string;
  price: number;
  stock: number;
}

/** Partial update — only send fields that changed (backend supports sparse updates). */
export type UpdateProductPayload = Partial<CreateProductPayload>;

// ─── Cart ──────────────────────────────────────────────────────
/** domain.CartItem — product is always populated from GET /cart/items. */
export interface CartItem {
  product: Product;
  quantity: number;
}

// ─── Order ────────────────────────────────────────────────────
/** dto.Product (embedded in OrderItem) — no price/stock here. */
export interface OrderItemProduct {
  id: number;
  name: string;
  description: string;
  sku: string;
}

/**
 * Backend: dto.CreateOrderResponse item shape.
 * `product` is populated on GET /orders/:id only — the list endpoint omits it.
 */
export interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
  product?: OrderItemProduct;
}

/**
 * Backend: dto.CreateOrderResponse / list item.
 * Fields: id, user_id, order_date (ISO timestamp), total_amount, items.
 * There is NO status, NO created_at, NO total_price, NO updated_at on the backend.
 *
 * The `statusLabel` used in the UI is a UI-only placeholder —
 * the backend has no status column. Remove this comment when the backend adds one.
 */
export interface Order {
  id: number;
  user_id: number;
  order_date: string;
  total_amount: number;
  items: OrderItem[];
}

export interface CreateOrderPayload {
  items: Array<{ product_id: number; quantity: number }>;
}
