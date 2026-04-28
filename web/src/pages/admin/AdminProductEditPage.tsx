import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getProduct } from '@/lib/api/products';
import { ProductForm } from '@/components/admin/ProductForm';
import { Breadcrumb, ErrorMessage, PageHeader, PageLoader } from '@/components/ui';

export function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: product, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId),
    enabled: !Number.isNaN(productId),
  });

  function handleSuccess() {
    void queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    void queryClient.invalidateQueries({ queryKey: ['admin-products-summary'] });
    void queryClient.invalidateQueries({ queryKey: ['product', productId] });
    navigate('/admin/products');
  }

  function handleCancel() {
    navigate('/admin/products');
  }

  return (
    <div className="flex flex-col gap-6 page-enter max-w-3xl">
      <Breadcrumb
        items={[
          { label: 'Admin',    to: '/admin' },
          { label: 'Products', to: '/admin/products' },
          { label: product?.name ?? `#${productId}` },
        ]}
      />
      <PageHeader
        kicker="Edit product"
        title={product?.name ?? 'Loading…'}
        subtitle="Update fields below. Only changed fields will be saved."
      />

      {isLoading && <PageLoader />}

      {isError && (
        <ErrorMessage
          message={(error as Error)?.message ?? 'Failed to load product.'}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && product && (
        <ProductForm product={product} onSuccess={handleSuccess} onCancel={handleCancel} />
      )}
    </div>
  );
}
