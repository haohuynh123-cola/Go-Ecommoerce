import { useQuery } from '@tanstack/react-query';

import { listProducts } from '@/lib/api/products';
import { ProductCard } from '@/components/product/ProductCard';

interface RelatedProductsProps {
  /** ID of the current product — excluded from the related list. */
  currentProductId: number;
  /** Max items to render. Default 4. */
  limit?: number;
}

/**
 * "You may also like" — shows a small grid of other products.
 *
 * NOTE: There is no `/products/:id/related` endpoint on the backend yet, so we
 * fetch the first page of `listProducts`, filter out the current item, and
 * take the first `limit` results. When the backend adds tag/category-based
 * relatedness, swap the query function here.
 */
export function RelatedProducts({ currentProductId, limit = 4 }: RelatedProductsProps) {
  const fetchSize = limit + 1; // +1 in case the current product is in the page

  const { data, isLoading, isError } = useQuery({
    queryKey: ['related-products', { excludeId: currentProductId, limit }],
    queryFn: () => listProducts({ page: 1, page_size: fetchSize }),
    staleTime: 60_000,
  });

  const items = (data?.data ?? [])
    .filter((p) => p.id !== currentProductId)
    .slice(0, limit);

  if (!isLoading && (isError || items.length === 0)) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-products-heading"
      className="mt-12 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-6 md:p-8"
    >
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2
            id="related-products-heading"
            className="text-lg md:text-xl font-bold text-[var(--color-ink)] tracking-tight"
          >
            You may also like
          </h2>
          <p className="mt-1 text-xs md:text-sm text-[var(--color-ink-muted)]">
            Hand-picked picks based on this product
          </p>
        </div>
      </header>

      <hr className="mt-3 mb-5 border-t border-[var(--color-border-subtle)]" />

      {isLoading ? (
        <RelatedSkeleton count={limit} />
      ) : (
        <ul className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </ul>
      )}
    </section>
  );
}

function RelatedSkeleton({ count }: { count: number }) {
  return (
    <ul
      aria-hidden
      className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
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
