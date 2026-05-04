import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { listProductComments } from '@/lib/api/comments';
import { useAuth } from '@/hooks/useAuth';
import { ErrorMessage } from '@/components/ui';
import { CommentList, CommentListSkeleton } from './CommentList';
import { RatingSummary } from './RatingSummary';
import { ReviewModal } from './ReviewModal';
import type { Product, ProductComment } from '@/lib/api/types';

interface ProductCommentsProps {
  /** Minimal product info; passed to the review modal for its header card. */
  product: Pick<Product, 'id' | 'name'>;
}

/** Compute average rating from an array of top-level comments (rating > 0 only). */
function computeAverageRating(comments: ProductComment[]): number | null {
  const rated = comments.filter((c) => c.rating > 0 && c.parent_comment_id == null);
  if (rated.length === 0) return null;
  const sum = rated.reduce((acc, c) => acc + c.rating, 0);
  return Math.round((sum / rated.length) * 10) / 10;
}

export function ProductComments({ product }: ProductCommentsProps) {
  const productId = product.id;
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['product-comments', productId],
    queryFn: () => listProductComments(productId),
    staleTime: 30_000,
  });

  const comments = data?.data ?? [];
  // The list endpoint does not paginate yet — see comments.ts. When it does,
  // re-introduce a page state and read `pagination.total_items` here.
  const totalCount = comments.length;

  const avgRating = computeAverageRating(comments);

  function handleWriteReview() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${productId}` } } });
      return;
    }
    setIsReviewOpen(true);
  }

  return (
    <section
      aria-labelledby="product-comments-heading"
      className="mt-12 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-6 md:p-8"
    >
      <div className="flex items-center gap-2.5 flex-wrap mb-4">
        <h2
          id="product-comments-heading"
          className="text-lg md:text-xl font-bold text-[var(--color-ink)] tracking-tight"
        >
          Đánh giá sản phẩm
        </h2>
        {totalCount > 0 && (
          <span className="inline-flex items-center h-5 px-2 rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand)] text-[length:var(--text-xs)] font-semibold">
            {totalCount}
          </span>
        )}
      </div>

      {/* ── Summary card with "Viết đánh giá" trigger ─────────── */}
      <RatingSummary
        comments={comments}
        totalCount={totalCount}
        averageRating={avgRating}
        onWriteReview={handleWriteReview}
      />

      {/* Guests get a subtle inline hint under the summary */}
      {!isAuthenticated && (
        <p className="mt-3 text-[length:var(--text-xs)] text-[var(--color-ink-muted)]">
          <Link
            to="/login"
            state={{ from: { pathname: `/products/${productId}` } }}
            className="text-[var(--color-brand)] hover:underline font-medium"
          >
            Đăng nhập
          </Link>{' '}
          để gửi đánh giá của bạn.
        </p>
      )}

      <hr className="my-6 border-t border-[var(--color-border-subtle)]" />

      {/* ── Comments list ─────────────────────────────────────── */}
      {isLoading && <CommentListSkeleton rows={3} />}

      {isError && (
        <ErrorMessage
          message={(error as Error)?.message ?? 'Không tải được đánh giá.'}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && comments.length === 0 && (
        <p className="text-[length:var(--text-sm)] text-[var(--color-ink-muted)]">
          Chưa có đánh giá nào — hãy là người đầu tiên đánh giá sản phẩm này.
        </p>
      )}

      {!isLoading && !isError && comments.length > 0 && (
        <CommentList comments={comments} productId={productId} />
      )}

      {/* ── Modal ─────────────────────────────────────────────── */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        product={product}
      />
    </section>
  );
}
