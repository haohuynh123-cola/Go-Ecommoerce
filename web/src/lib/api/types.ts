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

/** POST /auth/verify-otp — returns the verified user. No token issued; user logs in afterwards. */
export interface VerifyOtpResponse {
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

/** Status enum — must stay in sync with the Go backend's OrderStatus type. */
export const ORDER_STATUSES = ['Created', 'Confirmed', 'Shipping', 'Delivered', 'Cancelled'] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

/** dto.Product (embedded in OrderItem) — price is present per the actual API response. */
export interface OrderItemProduct {
  id: number;
  name: string;
  description: string;
  sku: string;
  price?: number;
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
 * Fields: id, user_id, order_date (ISO timestamp), total_amount, status, items.
 * `status` is present from PATCH /orders/:id/status and GET /orders/:id.
 * `activities` is only present on GET /orders/:id (detail) — the list endpoint omits it.
 */
export interface Order {
  id: number;
  user_id: number;
  order_date: string;
  total_amount: number;
  status?: OrderStatus;
  items: OrderItem[];
  /** Populated on GET /orders/:id only. Sorted DESC by the backend; sort defensively client-side. */
  activities?: OrderActivity[];
}

export interface CreateOrderPayload {
  items: Array<{ product_id: number; quantity: number }>;
}

/** Activity log entry returned by GET /orders/:id/activities */
export interface OrderActivity {
  order_id: number;
  activity_type: string;
  description: string;
  activity_at: string;
}
