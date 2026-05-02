import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';

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
import { CatalogSidebar } from '@/components/product/CatalogSidebar';
import { IconFilter, IconSearch, IconClose } from '@/components/layout/icons';
import { applyFacets, countFacets, BRANDS, CATEGORIES } from '@/lib/utils/catalog';
import type { Product } from '@/lib/api/types';

const PAGE_SIZE = 12;
// Wide window pulled from the backend so we can facet + paginate client-side.
// TODO: when backend supports category/brand filters, switch to server pagination.
const FETCH_SIZE = 100;

const SORT_OPTIONS = [
  { value: 'relevance',  label: 'Most relevant' },
  { value: 'price_asc',  label: 'Price · low → high' },
  { value: 'price_desc', label: 'Price · high → low' },
  { value: 'newest',     label: 'Newest' },
] as const;

type SortValue = typeof SORT_OPTIONS[number]['value'];

const VALID_SORTS = new Set<SortValue>(SORT_OPTIONS.map((o) => o.value));
const VALID_CATEGORIES = new Set(CATEGORIES.map((c) => c.slug));
const VALID_BRANDS = new Set(BRANDS.map((b) => b.slug));

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawCategory = searchParams.get('category');
  const rawBrand = searchParams.get('brand');
  const rawSort = searchParams.get('sort') as SortValue | null;

  const selectedCategory = rawCategory && VALID_CATEGORIES.has(rawCategory) ? rawCategory : null;
  const selectedBrand = rawBrand && VALID_BRANDS.has(rawBrand) ? rawBrand : null;
  const sort: SortValue = rawSort && VALID_SORTS.has(rawSort) ? rawSort : 'relevance';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const [nameInput, setNameInput] = useState(searchParams.get('name') ?? '');
  const [skuInput, setSkuInput] = useState(searchParams.get('sku') ?? '');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const name = useDebounce(nameInput, 400);
  const sku = useDebounce(skuInput, 400);

  // Backend fetch — only `name` and `sku` are supported, plus a wide page.
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['catalog', { name, sku }],
    queryFn: () => listProducts({ name, sku, page: 1, page_size: FETCH_SIZE }),
  });

  const allProducts = data?.data ?? [];

  // Facet counts derived from the search-filtered (pre-facet) set.
  const counts = useMemo(
    () => countFacets(allProducts, selectedCategory, selectedBrand),
    [allProducts, selectedCategory, selectedBrand],
  );

  // Apply facets, sort, paginate — all in-memory.
  const facetFiltered = useMemo(
    () => applyFacets(allProducts, selectedCategory, selectedBrand),
    [allProducts, selectedCategory, selectedBrand],
  );

  const sorted = useMemo(() => sortProducts(facetFiltered, sort), [facetFiltered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const visible = sorted.slice(pageStart, pageStart + PAGE_SIZE);

  const total = sorted.length;
  const hasActiveFilter = Boolean(selectedCategory || selectedBrand || name || sku);

  // ─── URL helpers ─────────────────────────────────────────
  function patchParams(patch: Record<string, string | null>, opts: { resetPage?: boolean } = {}) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === '') next.delete(k);
        else next.set(k, v);
      }
      if (opts.resetPage) next.set('page', '1');
      return next;
    });
  }

  function handleCategorySelect(slug: string | null) {
    patchParams({ category: slug }, { resetPage: true });
    setMobileFiltersOpen(false);
  }

  function handleBrandSelect(slug: string | null) {
    patchParams({ brand: slug }, { resetPage: true });
    setMobileFiltersOpen(false);
  }

  function handleSortChange(value: string) {
    patchParams({ sort: value === 'relevance' ? null : value }, { resetPage: true });
  }

  function handlePageChange(newPage: number) {
    patchParams({ page: String(newPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function applySearch() {
    patchParams({ name: nameInput || null, sku: skuInput || null }, { resetPage: true });
  }

  function clearAllFilters() {
    setNameInput('');
    setSkuInput('');
    setSearchParams(new URLSearchParams());
    setMobileFiltersOpen(false);
  }

  const sortControl = (
    <label className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
      <span className="hidden sm:inline">Sort by</span>
      <select
        value={sort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="h-10 px-3 pr-8 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-brand)] focus:shadow-[var(--shadow-focus)] transition cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="py-8 md:py-10 page-enter">
      <div className="container">
        {hasActiveFilter ? (
          <>
            <Breadcrumb
              className="mb-5"
              items={[{ label: 'Home', to: '/' }, { label: 'Catalog' }]}
            />

            <PageHeader
              className="mb-6"
              title="Catalog"
              subtitle={
                isLoading ? undefined :
                total > 0
                  ? <>Showing <span className="font-semibold text-[var(--color-ink)]">{total}</span> result{total === 1 ? '' : 's'}{name ? <> for <span className="font-semibold text-[var(--color-ink)]">"{name}"</span></> : null}</>
                  : 'No results.'
              }
              actions={
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand)] hover:border-[var(--color-brand)] transition-colors"
                  >
                    <IconFilter width={16} height={16} />
                    Filters
                    <span className="grid place-items-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-[var(--color-brand)] text-white text-[10px] font-bold">
                      {[selectedCategory, selectedBrand, name, sku].filter(Boolean).length}
                    </span>
                  </button>
                  {sortControl}
                </div>
              }
            />
          </>
        ) : null /* Bare homepage: no breadcrumb / title / sort / toolbar — just the grid below the hero. */}

        {/* ─── Layout: sidebar shown only when a filter is active ─── */}
        <div
          className={clsx(
            'grid gap-6 lg:gap-8',
            hasActiveFilter && 'lg:grid-cols-[16rem_1fr]',
          )}
        >
          {/* Desktop sidebar — only when filtering */}
          {hasActiveFilter && (
            <div className="hidden lg:block">
              <CatalogSidebar
                selectedCategory={selectedCategory}
                selectedBrand={selectedBrand}
                counts={counts}
                onSelectCategory={handleCategorySelect}
                onSelectBrand={handleBrandSelect}
                onClearAll={clearAllFilters}
              />
            </div>
          )}

          {/* Mobile drawer */}
          {mobileFiltersOpen && hasActiveFilter && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              className="lg:hidden fixed inset-0 z-[120] flex"
              onClick={() => setMobileFiltersOpen(false)}
            >
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative ml-auto w-[min(86vw,22rem)] h-full bg-[var(--color-bg)] border-l border-[var(--color-border-subtle)] shadow-2xl overflow-y-auto p-5"
              >
                <header className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-[var(--color-ink)]">Filters</h2>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    aria-label="Close filters"
                    className="grid place-items-center w-9 h-9 rounded-full hover:bg-[var(--color-surface-muted)] text-[var(--color-ink-secondary)] transition-colors"
                  >
                    <IconClose width={18} height={18} />
                  </button>
                </header>
                <CatalogSidebar
                  selectedCategory={selectedCategory}
                  selectedBrand={selectedBrand}
                  counts={counts}
                  onSelectCategory={handleCategorySelect}
                  onSelectBrand={handleBrandSelect}
                  onClearAll={clearAllFilters}
                />
              </div>
            </div>
          )}

          {/* ─── Main column ────────────────────────────────── */}
          <div className="min-w-0">
            {/* Search toolbar — only when filtering */}
            {hasActiveFilter && (
              <div className="flex flex-wrap gap-3 items-center mb-6 p-3 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)]">
                <SearchInput
                  placeholder="Search by name…"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                  aria-label="Filter by product name"
                  className="flex-1 min-w-[14rem]"
                />
                <input
                  type="search"
                  placeholder="Filter by SKU"
                  value={skuInput}
                  onChange={(e) => setSkuInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                  className="w-40 h-10 px-3 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] border border-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-brand)] focus:bg-[var(--color-surface-raised)] focus:shadow-[var(--shadow-focus)] transition"
                  aria-label="Filter by SKU"
                />
                <button
                  type="button"
                  onClick={applySearch}
                  className="h-10 px-5 rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-semibold transition-colors"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Active facet chips */}
            {(selectedCategory || selectedBrand) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategory && (
                  <ActiveChip
                    label={CATEGORIES.find((c) => c.slug === selectedCategory)?.label ?? selectedCategory}
                    onRemove={() => handleCategorySelect(null)}
                  />
                )}
                {selectedBrand && (
                  <ActiveChip
                    label={BRANDS.find((b) => b.slug === selectedBrand)?.label ?? selectedBrand}
                    onRemove={() => handleBrandSelect(null)}
                  />
                )}
              </div>
            )}

            {/* States */}
            {isLoading && <PageLoader />}

            {isError && (
              <ErrorMessage
                message={(error as Error)?.message ?? 'Failed to load products.'}
                onRetry={() => refetch()}
              />
            )}

            {!isLoading && !isError && (
              <>
                {visible.length === 0 ? (
                  <EmptyState
                    Icon={IconSearch}
                    title="No products match these filters"
                    description="Try removing a filter or searching for something else."
                    actions={hasActiveFilter ? (
                      <button
                        type="button"
                        onClick={clearAllFilters}
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
                    {visible.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </ul>
                )}

                {totalPages > 1 && (
                  <Pagination
                    page={safePage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────

function sortProducts(items: Product[], sort: SortValue): Product[] {
  if (sort === 'relevance') return items;
  const copy = [...items];
  switch (sort) {
    case 'price_asc':  return copy.sort((a, b) => a.price - b.price);
    case 'price_desc': return copy.sort((a, b) => b.price - a.price);
    case 'newest':     return copy.sort((a, b) => b.id - a.id);
    default:           return copy;
  }
}

interface ActiveChipProps {
  label: string;
  onRemove: () => void;
}

function ActiveChip({ label, onRemove }: ActiveChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 h-8 pl-3 pr-1.5 rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand)] text-xs font-semibold">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="grid place-items-center w-5 h-5 rounded-full hover:bg-[var(--color-brand)] hover:text-white transition-colors"
      >
        <IconClose width={12} height={12} />
      </button>
    </span>
  );
}
