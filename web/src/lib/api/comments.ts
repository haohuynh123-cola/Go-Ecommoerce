/**
 * API client for product comments / reviews.
 *
 * Backend routes (registered in internal/modules/comment/handler.go):
 *
 *   GET  /comments/product/:product_id/comments
 *        Response: ApiSuccess<CommentResponse[]>
 *        - Returns all comments for the product.
 *        - Authentication: not required (public read).
 *
 *   POST /comments/
 *        Body: { user_id, product_id, comment, rating?, parent_comment_id? }
 *        Response: ApiSuccess<CommentResponse>
 *        - Authentication: required (raw JWT in Authorization header — no "Bearer" prefix).
 *        - For top-level reviews: parent_comment_id omitted (null), rating 1–5.
 *        - For replies: parent_comment_id set to parent id, rating omitted/null.
 *
 * No edit or delete endpoints are wired in the frontend at this time.
 */

import apiClient from './client';
import type { ApiSuccess, ProductComment, CreateProductCommentPayload } from './types';

/** Default page size for the comments list. */
export const COMMENTS_PAGE_SIZE = 10;

/**
 * Fetch all top-level comments for a product.
 * Backend currently does not paginate; pagination is returned as undefined so callers can
 * keep their existing UI without showing a "Load more" control.
 */
export async function listProductComments(
  productId: number,
  _page = 1,
  _pageSize = COMMENTS_PAGE_SIZE,
): Promise<{ data: ProductComment[]; pagination: undefined }> {
  void _page;
  void _pageSize;
  const res = await apiClient.get<ApiSuccess<ProductComment[] | null>>(
    `/comments/product/${productId}/comments`,
  );
  return {
    data: nestComments(res.data.data ?? []),
    pagination: undefined,
  };
}

/**
 * Build a 1-level deep comment tree from the flat list returned by the backend.
 *
 * The backend currently sends every comment (top-level + replies) as a single
 * flat array with no `replies` field populated. This helper:
 *   - separates top-level comments (parent_comment_id == null) from replies
 *   - attaches each reply to its parent's `replies` array
 *   - guarantees `replies: []` on every node so renderers never see undefined
 *   - sorts replies by ascending id (oldest first); orphaned replies whose
 *     parent isn't in the response are surfaced as top-level so they don't
 *     silently disappear
 *
 * Move this server-side once the backend grows a real tree-aware list endpoint.
 */
function nestComments(flat: ProductComment[]): ProductComment[] {
  const byParent = new Map<number, ProductComment[]>();
  const topLevel: ProductComment[] = [];
  const knownIds = new Set(flat.map((c) => c.id));

  for (const raw of flat) {
    const node: ProductComment = { ...raw, replies: [] };
    const parentId = node.parent_comment_id;
    if (parentId == null || !knownIds.has(parentId)) {
      topLevel.push(node);
    } else {
      const bucket = byParent.get(parentId) ?? [];
      bucket.push(node);
      byParent.set(parentId, bucket);
    }
  }

  for (const parent of topLevel) {
    const replies = byParent.get(parent.id);
    if (replies) {
      replies.sort((a, b) => a.id - b.id);
      parent.replies = replies;
    }
  }

  return topLevel;
}

/**
 * Post a new comment or reply on a product.
 * The caller must be authenticated; the auth header is attached by the apiClient interceptor.
 *
 * @param productId - The product to comment on (sent as product_id in the body).
 * @param userId    - The authenticated user's id (sent as user_id in the body).
 * @param payload   - Comment text, rating (0 for replies), and optional parent_comment_id.
 * @returns         The newly created ProductComment.
 */
export async function createProductComment(
  productId: number,
  userId: number,
  payload: CreateProductCommentPayload,
): Promise<ProductComment> {
  const body: Record<string, unknown> = {
    user_id: userId,
    product_id: productId,
    comment: payload.comment,
    rating: payload.rating,
  };
  if (payload.parent_comment_id) {
    body.parent_comment_id = payload.parent_comment_id;
  }
  const res = await apiClient.post<ApiSuccess<ProductComment>>(`/comments/`, body);
  return res.data.data;
}
