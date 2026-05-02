import { useQueries } from '@tanstack/react-query';

import { getProduct } from '@/lib/api/products';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/lib/api/types';

interface RecentlyViewedProps {
  /**
   * If provided, the current product is excluded from the list.
   * Use on the product detail page so a user doesn't see "the product they're
   * looking at" inside the recently-viewed strip.
   */
  excludeId?: number;
  /** Max items to render. Defaults to 6. */
  limit?: number;
}

/**
 * "Recently viewed" — pulls IDs from the localStorage cache and resolves each
 * to a Product via TanStack Query. Cached fetches mean revisiting a product is
 * instant (TanStack already has it from the previous detail-page visit).
 */
export function RecentlyViewed({ excludeId, limit = 6 }: RecentlyViewedProps) {
  const { ids, clear } = useRecentlyViewed();

  const visibleIds = ids
    .filter((id) => id !== excludeId)
    .slice(0, limit);

  const queries = useQueries({
    queries: visibleIds.map((id) => ({
      queryKey: ['product', id],
      queryFn: () => getProduct(id),
      staleTime: 5 * 60_000,
    })),
  });

  // Resolve to products that actually loaded — silently drop failures (e.g.
  // products that were deleted server-side after being cached locally).
  const products: Product[] = queries
    .map((q) => q.data)
    .filter((p): p is Product => Boolean(p));

  const isLoading = queries.some((q) => q.isLoading) && products.length === 0;

  if (visibleIds.length === 0 || (!isLoading && products.length === 0)) {
    return null;
  }

  return (
    <section
      aria-labelledby="recently-viewed-heading"
      className="mt-12 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-6 md:p-8"
    >
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2
            id="recently-viewed-heading"
            className="text-lg md:text-xl font-bold text-[var(--color-ink)] tracking-tight"
          >
            Recently viewed
          </h2>
          <p className="mt-1 text-xs md:text-sm text-[var(--color-ink-muted)]">
            Pick up where you left off
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-brand)] transition-colors underline-offset-4 hover:underline"
        >
          Clear history
        </button>
      </header>

      <hr className="mt-3 mb-5 border-t border-[var(--color-border-subtle)]" />

      {isLoading ? (
        <RecentlyViewedSkeleton count={Math.min(visibleIds.length, limit)} />
      ) : (
        <ul className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </ul>
      )}
    </section>
  );
}

function RecentlyViewedSkeleton({ count }: { count: number }) {
  return (
    <ul
      aria-hidden
      className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
    >
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="flex flex-col bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] overflow-hidden"
        >
          <div className="aspect-square bg-[var(--color-surface-muted)] animate-pulse" />
          <div className="flex flex-col p-4 gap-2.5">
            <div className="h-4 w-3/4 rounded bg-[var(--color-surface-muted)] animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-[var(--color-surface-muted)] animate-pulse" />
            <div className="h-6 w-1/3 rounded bg-[var(--color-surface-muted)] animate-pulse mt-1" />
            <div className="h-10 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] animate-pulse mt-2" />
          </div>
        </li>
      ))}
    </ul>
  );
}
