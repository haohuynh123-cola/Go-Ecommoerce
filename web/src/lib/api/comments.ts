/**
 * API client for product comments / reviews.
 *
 * Assumed REST contract (backend must implement):
 *
 *   GET  /products/:productId/comments?page=<n>&page_size=<n>
 *        Response: ApiPaginated<ProductComment>
 *        - Returns top-level comments only (parent_comment_id IS NULL).
 *        - Ordered newest-first.
 *        - Each item includes a nested `replies` array (backend JOIN, capped at 50).
 *        - Authentication: not required (public read).
 *
 *   POST /products/:productId/comments
 *        Body: CreateProductCommentPayload
 *        Response: ApiSuccess<ProductComment>
 *        - Authentication: required (raw JWT in Authorization header — no "Bearer" prefix).
 *        - For top-level reviews: parent_comment_id must be null, rating 1–5.
 *        - For replies: parent_comment_id must be set, rating must be 0.
 *
 * No edit or delete endpoints are wired in the frontend at this time.
 */

import apiClient from './client';
import type { ApiPaginated, ApiSuccess, ProductComment, CreateProductCommentPayload } from './types';

/** Default page size for the comments list. */
export const COMMENTS_PAGE_SIZE = 10;

/**
 * Fetch a paginated list of top-level comments for a product.
 * Each comment includes a nested `replies` array (up to 50 entries).
 */
export async function listProductComments(
  productId: number,
  page = 1,
  pageSize = COMMENTS_PAGE_SIZE,
): Promise<{ data: ProductComment[]; pagination: ApiPaginated<ProductComment>['pagination'] }> {
  const res = await apiClient.get<ApiPaginated<ProductComment>>(
    `/products/${productId}/comments`,
    { params: { page, page_size: pageSize } },
  );
  return {
    data: res.data.data,
    pagination: res.data.pagination,
  };
}

/**
 * Post a new comment or reply on a product.
 * The caller must be authenticated; the auth header is attached by the apiClient interceptor.
 *
 * @param productId - The product to comment on.
 * @param payload   - Comment text, rating (0 for replies), and optional parent_comment_id.
 * @returns         The newly created ProductComment (with empty `replies` array).
 */
export async function createProductComment(
  productId: number,
  payload: CreateProductCommentPayload,
): Promise<ProductComment> {
  const res = await apiClient.post<ApiSuccess<ProductComment>>(
    `/products/${productId}/comments`,
    payload,
  );
  return res.data.data;
}
