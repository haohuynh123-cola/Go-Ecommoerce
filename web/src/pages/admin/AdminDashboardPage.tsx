import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { listProducts } from '@/lib/api/products';
import { listOrders } from '@/lib/api/orders';
import { PageHeader } from '@/components/ui';
import {
  KpiGrid,
  SparklineChart,
  RecentOrdersPanel,
} from '@/components/dashboard';

export function AdminDashboardPage() {
  const { data: productsSummary, isLoading: isProductsLoading } = useQuery({
    queryKey: ['admin-products-summary'],
    queryFn: () => listProducts({ page: 1, page_size: 1 }),
  });
  const { data: orders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: listOrders,
  });

  const isDashboardLoading = isOrdersLoading || isProductsLoading;

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total_amount ?? 0), 0);

  const last7DayOrders = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return orders.filter((o) => new Date(o.order_date).getTime() >= cutoff);
  }, [orders]);

  const sparklineData = useMemo(() => {
    // TODO: replace with real per-day order counts from the backend.
    const buckets = Array.from({ length: 14 }, () => 0);
    for (const o of orders) {
      const t = new Date(o.order_date).getTime();
      if (!Number.isFinite(t)) continue;
      const days = Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000));
      if (days >= 0 && days < 14) buckets[13 - days]++;
    }
    return buckets;
  }, [orders]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
        .slice(0, 5),
    [orders],
  );

  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : undefined;

  return (
    <div className="flex flex-col gap-6 page-enter">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back. Here's what's happening with your store today."
        actions={
          <>
            <Link
              to="/admin/products"
              className="h-10 px-4 grid place-items-center rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
            >
              Manage products
            </Link>
            <Link
              to="/admin/products/new"
              className="h-10 px-4 grid place-items-center rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-semibold shadow-[var(--shadow-xs)] transition-colors"
            >
              + New product
            </Link>
          </>
        }
      />

      {/* ─── KPI cards ─────────────────────────────────────────── */}
      <KpiGrid
        orderCount={orders.length}
        last7DayOrderCount={last7DayOrders.length}
        totalRevenue={totalRevenue}
        productTotal={productsSummary?.pagination?.total_items}
        avgOrderValue={avgOrderValue}
        loading={isDashboardLoading}
      />

      <SparklineChart
        data={sparklineData}
        totalOrders={orders.length}
        last7DayOrderCount={last7DayOrders.length}
        loading={isOrdersLoading}
      />

      {/* ─── Recent orders ──────────────────────────────────────── */}
      <RecentOrdersPanel orders={recentOrders} loading={isOrdersLoading} />
    </div>
  );
}
