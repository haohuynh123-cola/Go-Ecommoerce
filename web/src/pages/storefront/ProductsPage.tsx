import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { listProducts } from '@/lib/api/products';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Breadcrumb,
  EmptyState,
  ErrorMessage,
  PageHeader,
  PageLoader,
  Pagination,
  SearchInput,
} from '@/components/ui';
import { ProductCard } from '@/components/product/ProductCard';
import { IconSearch } from '@/components/layout/icons';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most relevant' },
  { value: 'price_asc', label: 'Price · low → high' },
  { value: 'price_desc', label: 'Price · high → low' },
  { value: 'newest', label: 'Newest' },
] as const;

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [nameInput, setNameInput] = useState(searchParams.get('name') ?? '');
  const [skuInput, setSkuInput] = useState(searchParams.get('sku') ?? '');
  const [sort, setSort] = useState<string>(SORT_OPTIONS[0].value);
  const page = Number(searchParams.get('page') ?? '1');

  const name = useDebounce(nameInput, 400);
  const sku = useDebounce(skuInput, 400);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['products', { name, sku, page }],
    queryFn: () => listProducts({ name, sku, page, page_size: PAGE_SIZE }),
  });

  function handlePageChange(newPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function applyFilters() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nameInput) next.set('name', nameInput);
      else next.delete('name');
      if (skuInput) next.set('sku', skuInput);
      else next.delete('sku');
      next.set('page', '1');
      return next;
    });
  }

  function clearFilters() {
    setNameInput('');
    setSkuInput('');
    setSearchParams(new URLSearchParams());
  }

  const hasActiveFilter = Boolean(name || sku);
  const total = data?.pagination?.total_items ?? 0;

  return (
    <div className="py-8 md:py-10 page-enter">
      <div className="container">
        <Breadcrumb
          className="mb-5"
          items={[{ label: 'Home', to: '/' }, { label: 'All products' }]}
        />

        <PageHeader
          className="mb-6"
          title="All products"
          subtitle={
            isLoading ? undefined :
            total > 0
              ? <>Showing <span className="font-semibold text-[var(--color-ink)]">{total}</span> result{total === 1 ? '' : 's'}{name ? <> for <span className="font-semibold text-[var(--color-ink)]">"{name}"</span></> : null}</>
              : 'No results.'
          }
          actions={
            <label className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
              <span>Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 px-3 pr-8 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)] focus:shadow-[var(--shadow-focus)] transition cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          }
        />

        {/* ─── Filter bar ───────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 items-center mb-8 p-3 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)]">
          <SearchInput
            placeholder="Search by name…"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            aria-label="Filter by product name"
            className="flex-1 min-w-[14rem]"
          />
          <input
            type="search"
            placeholder="Filter by SKU"
            value={skuInput}
            onChange={(e) => setSkuInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="w-40 h-10 px-3 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] border border-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-brand)] focus:bg-[var(--color-surface-raised)] focus:shadow-[var(--shadow-focus)] transition"
            aria-label="Filter by SKU"
          />
          <button
            type="button"
            onClick={applyFilters}
            className="h-10 px-5 rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-semibold transition-colors"
          >
            Apply
          </button>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-10 px-3 rounded-[var(--radius-md)] text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-brand)] transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* ─── States ───────────────────────────────────────── */}
        {isLoading && <PageLoader />}

        {isError && (
          <ErrorMessage
            message={(error as Error).message ?? 'Failed to load products.'}
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && data && (
          <>
            {data.data.length === 0 ? (
              <EmptyState
                Icon={IconSearch}
                title="No products found"
                description="Try adjusting the search term or clearing filters to see more products."
                actions={hasActiveFilter ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="h-10 px-5 rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-semibold transition-colors"
                  >
                    Clear filters
                  </button>
                ) : undefined}
              />
            ) : (
              <ul
                className="grid gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))' }}
                role="list"
              >
                {data.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ul>
            )}

            <Pagination
              page={page}
              totalPages={data.pagination?.total_pages ?? 1}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}

