import apiClient from './client';
import type { ApiSuccess, Order, OrderStatus, CreateOrderPayload } from './types';

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const res = await apiClient.post<ApiSuccess<Order>>('/orders/', payload);
  return res.data.data;
}

/**
 * GET /orders/ — returns a flat array of orders for the authenticated user.
 *
 * NOTE (admin): The backend returns only the current user's orders — there is no
 * admin endpoint to list all users' orders. The admin panel surfaces this
 * limitation with a notice. Update when the backend adds a role-gated endpoint.
 */
export async function listOrders(): Promise<Order[]> {
  const res = await apiClient.get<ApiSuccess<Order[]>>('/orders/');
  return res.data.data ?? [];
}

/**
 * GET /orders/:id — detail endpoint; `item.product` is populated here.
 * The list endpoint omits item.product.
 */
export async function getOrder(id: number): Promise<Order> {
  const res = await apiClient.get<ApiSuccess<Order>>(`/orders/${id}`);
  return res.data.data;
}

/**
 * PATCH /orders/:id/status — update order status.
 * Returns the full updated order detail (same shape as GET /orders/:id).
 */
export async function updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  const res = await apiClient.patch<ApiSuccess<Order>>(`/orders/${id}/status`, { status });
  return res.data.data;
}

