import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listProducts, deleteProduct } from '@/lib/api/products';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import type { Product } from '@/lib/api/types';

const PAGE_SIZE = 20;

export function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-products', page],
    queryFn: () => listProducts({ page, page_size: PAGE_SIZE }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      setDeleteTarget(null);
      setDeleteError('');
      void queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-products-summary'] });
    },
    onError: (err: Error) => {
      setDeleteError(err.message ?? 'Delete failed.');
    },
  });

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
  }

  function handleFormSuccess() {
    setShowCreate(false);
    setEditTarget(null);
    void queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    void queryClient.invalidateQueries({ queryKey: ['admin-products-summary'] });
  }

  return (
    <div className="flex flex-col gap-6 page-enter">
      <header className="flex items-end justify-between flex-wrap gap-4 border-b border-[var(--color-border-subtle)] pb-6">
        <div>
          <p className="kicker">Inventory</p>
          <h1 className="page-title">Products</h1>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          + New product
        </Button>
      </header>

      {isLoading && <PageLoader />}

      {isError && (
        <ErrorMessage
          message={(error as Error)?.message ?? 'Failed to load products.'}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && data && (
        <>
          {deleteError && (
            <ErrorMessage message={deleteError} onRetry={() => setDeleteError('')} />
          )}

          <div className="overflow-x-auto border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-surface-raised)]">
            <table className="w-full border-collapse text-[length:var(--text-sm)]" role="table">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th
                    scope="col"
                    className="text-left px-4 py-3 text-[length:var(--text-xs)] font-[var(--font-weight-medium)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)] whitespace-nowrap"
                  >
                    SKU
                  </th>
                  <th
                    scope="col"
                    className="text-left px-4 py-3 text-[length:var(--text-xs)] font-[var(--font-weight-medium)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)]"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="text-left px-4 py-3 text-[length:var(--text-xs)] font-[var(--font-weight-medium)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)]"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="text-left px-4 py-3 text-[length:var(--text-xs)] font-[var(--font-weight-medium)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)]"
                  >
                    Stock
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-accent-subtle)] transition-colors duration-[var(--duration-fast)]"
                  >
                    <td className="px-4 py-3 font-mono text-[length:var(--text-xs)] text-[var(--color-ink-muted)] tracking-[0.05em] whitespace-nowrap align-middle">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3 font-[var(--font-weight-medium)] text-[var(--color-ink)] align-middle">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-ink-secondary)] align-middle">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <Badge variant={product.stock === 0 ? 'error' : 'success'}>
                        {product.stock}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex gap-2 justify-end whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditTarget(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setDeleteError('');
                            setDeleteTarget(product);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            totalPages={data.pagination?.total_pages ?? 1}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Create / edit modal */}
      {(showCreate || editTarget !== null) && (
        <ProductFormModal
          product={editTarget ?? undefined}
          onSuccess={handleFormSuccess}
          onClose={() => {
            setShowCreate(false);
            setEditTarget(null);
          }}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete product"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
