import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';

import { deleteProduct, listProducts } from '@/lib/api/products';
import { formatPrice } from '@/lib/utils/format';
import { useDebounce } from '@/hooks/useDebounce';
import {
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  GradientThumbnail,
  PageHeader,
  PageLoader,
  Pagination,
  SearchInput,
  SegmentedControl,
  StatusPill,
} from '@/components/ui';
import { KpiCard } from '@/components/dashboard';
import {
  IconBox,
  IconDownload,
  IconEdit,
  IconFilter,
  IconPlus,
  IconStore,
  IconTrash,
} from '@/components/layout/icons';
import type { Product } from '@/lib/api/types';

const PAGE_SIZE = 20;

export function AdminProductsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'out'>('all');

  const search = useDebounce(searchInput, 350);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => listProducts({ page, page_size: PAGE_SIZE, name: search || undefined }),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    if (stockFilter === 'all') return data.data;
    return data.data.filter((p) => (stockFilter === 'in' ? p.stock > 0 : p.stock === 0));
  }, [data, stockFilter]);

  const stats = useMemo(() => {
    if (!data) return { total: 0, inStock: 0, outOfStock: 0 };
    const total = data.pagination?.total_items ?? 0;
    const outOfStock = data.data.filter((p) => p.stock === 0).length;
    return { total, inStock: total - outOfStock, outOfStock };
  }, [data]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      setDeleteTarget(null);
      setDeleteError('');
      void queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-products-summary'] });
    },
    onError: (err: Error) => setDeleteError(err.message ?? 'Delete failed.'),
  });

  return (
    <div className="flex flex-col gap-6 page-enter">
      <PageHeader
        title="Products"
        subtitle="Manage your full catalog. Create, edit, or remove SKUs."
        actions={
          <>
            <button
              type="button"
              className="h-10 px-4 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
            >
              <IconDownload width={16} height={16} />
              Export
            </button>
            <Link
              to="/admin/products/new"
              className="h-10 px-4 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-semibold shadow-[var(--shadow-xs)] transition-colors"
            >
              <IconPlus width={16} height={16} />
              New product
            </Link>
          </>
        }
      />

      {/* ─── Stat strip ─────────────────────────────────────── */}
      <ul className="grid gap-3 grid-cols-1 sm:grid-cols-3" aria-label="Product summary">
        <KpiCard
          label="Total products"
          value={String(stats.total)}
          icon={<IconStore />}
          subtitle="All listings"
          loading={isLoading}
        />
        <KpiCard
          label="In stock"
          value={String(stats.inStock)}
          icon={<IconBox />}
          valueColor="success"
          subtitle="Available to sell"
          loading={isLoading}
        />
        <KpiCard
          label="Out of stock"
          value={String(stats.outOfStock)}
          icon={<IconBox />}
          valueColor="error"
          subtitle="Needs restock"
          loading={isLoading}
        />
      </ul>

      {/* ─── Toolbar ───────────────────────────────────────── */}
      <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-3 flex flex-wrap items-center gap-3">
        <SearchInput
          placeholder="Search products by name…"
          value={searchInput}
          onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
          aria-label="Search products"
          className="flex-1 min-w-[14rem]"
        />

        <SegmentedControl
          ariaLabel="Filter by stock"
          value={stockFilter}
          onChange={setStockFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'in',  label: 'In stock' },
            { value: 'out', label: 'Out of stock' },
          ]}
        />

        <button
          type="button"
          className="h-10 px-3 inline-flex items-center gap-2 rounded-[var(--radius-md)] text-sm font-medium text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)] transition-colors"
          title="More filters"
        >
          <IconFilter width={15} height={15} />
          More filters
        </button>
      </div>

      {/* ─── States ────────────────────────────────────────── */}
      {isLoading && <PageLoader />}

      {isError && (
        <ErrorMessage
          message={(error as Error)?.message ?? 'Failed to load products.'}
          onRetry={() => refetch()}
        />
      )}

      {deleteError && (
        <ErrorMessage message={deleteError} onRetry={() => setDeleteError('')} />
      )}

      {!isLoading && !isError && data && (
        <>
          {filtered.length === 0 ? (
            <EmptyProducts hasFilter={!!search || stockFilter !== 'all'} />
          ) : (
            <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" role="table">
                  <thead>
                    <tr className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border-subtle)]">
                      <Th>Product</Th>
                      <Th>SKU</Th>
                      <Th align="right">Price</Th>
                      <Th align="right">Stock</Th>
                      <Th>Status</Th>
                      <Th align="right">Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((product) => (
                      <ProductRow
                        key={product.id}
                        product={product}
                        onEdit={() => navigate(`/admin/products/${product.id}/edit`)}
                        onDelete={() => { setDeleteError(''); setDeleteTarget(product); }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)]">
                <p className="text-xs text-[var(--color-ink-muted)]">
                  Page {page} of {data.pagination?.total_pages ?? 1} · {data.pagination?.total_items ?? 0} total
                </p>
                <Pagination
                  page={page}
                  totalPages={data.pagination?.total_pages ?? 1}
                  onPageChange={setPage}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── Delete confirm ─────────────────────────────────── */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete product"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      scope="col"
      className={clsx(
        'px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)] whitespace-nowrap',
        align === 'right' ? 'text-right' : 'text-left',
      )}
    >
      {children}
    </th>
  );
}

interface ProductRowProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

function ProductRow({ product, onEdit, onDelete }: ProductRowProps) {
  const out = product.stock === 0;
  const low = product.stock > 0 && product.stock < 5;
  return (
    <tr className="border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-brand-subtle)]/40 transition-colors">
      {/* Product cell */}
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-3">
          <GradientThumbnail id={product.id} name={product.name} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--color-ink)] truncate max-w-[28ch]">
              {product.name}
            </p>
            <p className="text-xs text-[var(--color-ink-muted)] truncate max-w-[36ch]">
              {product.description}
            </p>
          </div>
        </div>
      </td>

      {/* SKU */}
      <td className="px-4 py-3 align-middle font-mono text-xs text-[var(--color-ink-secondary)] whitespace-nowrap">
        {product.sku}
      </td>

      {/* Price */}
      <td className="px-4 py-3 align-middle text-right font-semibold text-[var(--color-ink)] tabular-nums whitespace-nowrap">
        {formatPrice(product.price)}
      </td>

      {/* Stock */}
      <td className="px-4 py-3 align-middle text-right tabular-nums">
        <span className={out ? 'font-bold text-[var(--color-error)]' : low ? 'font-bold text-[var(--color-warning-text)]' : 'font-semibold text-[var(--color-ink)]'}>
          {product.stock}
        </span>
      </td>

      {/* Status pill */}
      <td className="px-4 py-3 align-middle">
        <StockPill stock={product.stock} />
      </td>

      {/* Actions */}
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="grid place-items-center w-8 h-8 rounded-md text-[var(--color-ink-secondary)] hover:text-[var(--color-brand)] hover:bg-[var(--color-brand-subtle)] transition-colors"
            aria-label={`Edit ${product.name}`}
            title="Edit"
          >
            <IconEdit width={15} height={15} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="grid place-items-center w-8 h-8 rounded-md text-[var(--color-ink-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-bg)] transition-colors"
            aria-label={`Delete ${product.name}`}
            title="Delete"
          >
            <IconTrash width={15} height={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function StockPill({ stock }: { stock: number }) {
  if (stock === 0) return <StatusPill tone="error">Out of stock</StatusPill>;
  if (stock < 5)   return <StatusPill tone="warning">Low stock</StatusPill>;
  return <StatusPill tone="success">Active</StatusPill>;
}

function EmptyProducts({ hasFilter }: { hasFilter: boolean }) {
  return (
    <EmptyState
      Icon={IconBox}
      size="md"
      title={hasFilter ? 'No products match this filter' : 'No products yet'}
      description={hasFilter
        ? 'Try clearing the search or stock filter.'
        : 'Create your first product to start filling out the catalog.'}
      actions={!hasFilter ? (
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-semibold transition-colors"
        >
          <IconPlus width={16} height={16} />
          New product
        </Link>
      ) : undefined}
    />
  );
}
