import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';

import { getProduct } from '@/lib/api/products';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { ProductCard } from '@/components/product/ProductCard';
import { Breadcrumb, EmptyState, PageHeader } from '@/components/ui';
import { IconHistory } from '@/components/layout/icons';
import type { Product } from '@/lib/api/types';

export function HistoryViewedPage() {
  const { ids, clear } = useRecentlyViewed();

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['product', id],
      queryFn: () => getProduct(id),
      staleTime: 5 * 60_000,
    })),
  });

  // Resolve to products that actually loaded — silently drop deleted/404s.
  const products: Product[] = queries
    .map((q) => q.data)
    .filter((p): p is Product => Boolean(p));

  const isInitialLoading = queries.some((q) => q.isLoading) && products.length === 0;

  return (
    <div className="py-8 md:py-10 page-enter">
      <div className="container">
        <Breadcrumb
          className="mb-6"
          items={[
            { label: 'Home', to: '/' },
            { label: 'Recently viewed' },
          ]}
        />

        <PageHeader
          title="Recently viewed"
          subtitle="Products you've checked out lately. Stored locally on this device."
          actions={
            ids.length > 0 ? (
              <button
                type="button"
                onClick={clear}
                className="h-10 px-4 rounded-[var(--radius-md)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink-secondary)] hover:bg-[var(--color-error-bg)] hover:text-[var(--color-error)] hover:border-[var(--color-error)] transition-colors"
              >
                Clear history
              </button>
            ) : null
          }
        />

        {ids.length === 0 ? (
          <EmptyState
            Icon={IconHistory}
            title="No history yet"
            description="Browse some products and they'll show up here so you can pick up where you left off."
            actions={
              <Link
                to="/"
                className="inline-flex items-center h-10 px-5 rounded-[var(--radius-md)] bg-[var(--color-brand)] text-white text-sm font-semibold hover:bg-[var(--color-brand-hover)] transition-colors"
              >
                Browse products
              </Link>
            }
          />
        ) : isInitialLoading ? (
          <HistorySkeleton count={Math.min(ids.length, 8)} />
        ) : products.length === 0 ? (
          <EmptyState
            Icon={IconHistory}
            title="History items unavailable"
            description="The products you viewed seem to no longer exist."
            actions={
              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center h-10 px-5 rounded-[var(--radius-md)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                Clear history
              </button>
            }
          />
        ) : (
          <>
            <p className="mt-2 mb-4 text-sm text-[var(--color-ink-muted)]">
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </p>
            <ul className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function HistorySkeleton({ count }: { count: number }) {
  return (
    <ul
      aria-hidden
      className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
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
