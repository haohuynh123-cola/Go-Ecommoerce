import apiClient from './client';
import type { ApiSuccess, CartItem } from './types';

export async function getCartItems(): Promise<CartItem[]> {
  const res = await apiClient.get<ApiSuccess<CartItem[]>>('/cart/items');
  return res.data.data ?? [];
}

export async function addToCart(product_id: number, quantity: number): Promise<string> {
  const res = await apiClient.post<ApiSuccess<string>>('/cart/add', { product_id, quantity });
  return res.data.data;
}

/**
 * PUT /cart/update — quantity must be >= 1 (backend binding:"required,min=1").
 * Quantity 0 will be rejected with 400. Use removeCartItem to remove an item entirely.
 */
export async function updateCartItem(product_id: number, quantity: number): Promise<string> {
  const res = await apiClient.put<ApiSuccess<string>>('/cart/update', { product_id, quantity });
  return res.data.data;
}

/** POST /cart/remove — removes a single item from the cart entirely. */
export async function removeCartItem(product_id: number): Promise<string> {
  const res = await apiClient.post<ApiSuccess<string>>('/cart/remove', { product_id });
  return res.data.data;
}

/** POST /cart/clear — clears all items for the authenticated user. */
export async function clearCart(): Promise<string> {
  const res = await apiClient.post<ApiSuccess<string>>('/cart/clear');
  return res.data.data;
}
