import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { ProductForm } from '@/components/admin/ProductForm';
import { Breadcrumb, PageHeader } from '@/components/ui';

export function AdminProductCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function handleSuccess() {
    void queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    void queryClient.invalidateQueries({ queryKey: ['admin-products-summary'] });
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
          { label: 'New product' },
        ]}
      />
      <PageHeader
        kicker="New product"
        title="Create a new product"
        subtitle="Fill out the catalog details. SKU must be unique."
      />
      <ProductForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
}
