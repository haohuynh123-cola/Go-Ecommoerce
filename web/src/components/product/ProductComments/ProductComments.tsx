import { useState, useId } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { listProductComments, COMMENTS_PAGE_SIZE } from '@/lib/api/comments';
import { useAuth } from '@/hooks/useAuth';
import { ErrorMessage } from '@/components/ui';
import { StarRating } from './StarRating';
import { CommentForm } from './CommentForm';
import { CommentList, CommentListSkeleton } from './CommentList';
import type { ProductComment } from '@/lib/api/types';

interface ProductCommentsProps {
  productId: number;
}

/** Compute average rating from an array of top-level comments (rating > 0 only). */
function computeAverageRating(comments: ProductComment[]): number | null {
  const rated = comments.filter((c) => c.rating > 0);
  if (rated.length === 0) return null;
  const sum = rated.reduce((acc, c) => acc + c.rating, 0);
  return Math.round((sum / rated.length) * 10) / 10;
}

export function ProductComments({ productId }: ProductCommentsProps) {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const formHeadingId = useId();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['product-comments', productId, page],
    queryFn: () => listProductComments(productId, page, COMMENTS_PAGE_SIZE),
    staleTime: 30_000,
  });

  const comments = data?.data ?? [];
  const pagination = data?.pagination;
  const totalCount = pagination?.total_items ?? 0;
  const hasMore = pagination ? page < pagination.total_pages : false;

  // Compute average from currently loaded page (first page gives the freshest spread)
  const avgRating = computeAverageRating(comments);

  return (
    <section
      aria-labelledby="product-comments-heading"
      className="mt-12 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-6 md:p-8"
    >
      {/* ── Section heading + summary ─────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2
            id="product-comments-heading"
            className="text-lg md:text-xl font-bold text-[var(--color-ink)] tracking-tight"
          >
            Customer reviews
          </h2>
          {totalCount > 0 && (
            <span className="inline-flex items-center h-5 px-2 rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand)] text-[length:var(--text-xs)] font-semibold">
              {totalCount}
            </span>
          )}
        </div>

        {/* Average rating summary (only when we have data) */}
        {avgRating !== null && totalCount > 0 && (
          <div className="flex items-center gap-2">
            <StarRating mode="display" value={avgRating} />
            <span className="text-[length:var(--text-sm)] font-semibold text-[var(--color-ink)]">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-[length:var(--text-xs)] text-[var(--color-ink-muted)]">
              ({totalCount} {totalCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}
      </div>

      <hr className="mt-3 mb-6 border-t border-[var(--color-border-subtle)]" />

      {/* ── Auth gate / form ──────────────────────────────────── */}
      {isAuthenticated ? (
        <div
          className="mb-8 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] p-5"
          aria-labelledby={formHeadingId}
        >
          <h3
            id={formHeadingId}
            className="text-[length:var(--text-sm)] font-semibold text-[var(--color-ink)] mb-4"
          >
            Write a review
          </h3>
          <CommentForm productId={productId} />
        </div>
      ) : (
        <div className="mb-8 rounded-[var(--radius-md)] bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] p-4">
          <p className="text-[length:var(--text-sm)] text-[var(--color-warning-text)]">
            <Link
              to="/login"
              state={{ from: { pathname: `/products/${productId}` } }}
              className="font-bold underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              Sign in
            </Link>{' '}
            to leave a review.
          </p>
        </div>
      )}

      {/* ── Comments list ─────────────────────────────────────── */}
      {isLoading && <CommentListSkeleton rows={3} />}

      {isError && (
        <ErrorMessage
          message={(error as Error)?.message ?? 'Could not load reviews.'}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && comments.length === 0 && (
        <p className="text-[length:var(--text-sm)] text-[var(--color-ink-muted)]">
          No reviews yet — be the first to review this product
          {!isAuthenticated && (
            <>
              .{' '}
              <Link
                to="/login"
                state={{ from: { pathname: `/products/${productId}` } }}
                className="text-[var(--color-brand)] hover:underline font-medium"
              >
                Sign in to leave one.
              </Link>
            </>
          )}
          {isAuthenticated && '.'}
        </p>
      )}

      {!isLoading && !isError && comments.length > 0 && (
        <CommentList comments={comments} productId={productId} />
      )}

      {/* ── Load more ─────────────────────────────────────────── */}
      {hasMore && !isLoading && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="h-9 px-6 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[length:var(--text-sm)] text-[var(--color-ink-secondary)] font-semibold hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand)] hover:border-[var(--color-brand)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-2"
          >
            Load more reviews
          </button>
        </div>
      )}
    </section>
  );
}
