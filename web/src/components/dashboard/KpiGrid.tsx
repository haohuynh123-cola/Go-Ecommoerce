import { IconBox, IconReceipt, IconStore } from '@/components/layout/icons';
import { formatPrice } from '@/lib/utils/format';
import type { KpiDelta } from './KpiCard';
import { KpiCard } from './KpiCard';

// ─── KpiGrid ──────────────────────────────────────────────────────────────────

export interface KpiGridProps {
  orderCount: number;
  last7DayOrderCount: number;
  totalRevenue: number;
  productTotal: number | undefined;
  avgOrderValue: number | undefined;
  /** When true, all four cards render skeleton placeholders for their data fields. */
  loading?: boolean;
}

export function KpiGrid({
  orderCount,
  last7DayOrderCount,
  totalRevenue,
  productTotal,
  avgOrderValue,
  loading = false,
}: KpiGridProps) {
  // last7DayOrderCount is kept in props for API compatibility with the parent
  // page. A future enhancement can use it to compute a prior-period delta once
  // the backend exposes a prior-7-day baseline. For now render 0.00% (muted),
  // matching the reference screenshot's no-data pattern.
  void last7DayOrderCount;

  const ordersDelta: KpiDelta | null = null;
  const revenueDelta: KpiDelta | null = null;
  const productsDelta: KpiDelta | null = null;
  const aovDelta: KpiDelta | null = null;

  return (
    <ul
      className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Key performance indicators"
    >
      <KpiCard
        icon={<IconReceipt />}
        label="Your orders"
        value={String(orderCount)}
        delta={ordersDelta}
        subtitle="Last 7 days"
        loading={loading}
      />

      <KpiCard
        icon={<IconStore />}
        label="Revenue"
        value={formatPrice(totalRevenue)}
        topRight={<span className="text-sm font-medium tabular-nums">$</span>}
        delta={revenueDelta}
        subtitle="Lifetime"
        loading={loading}
      />

      <KpiCard
        icon={<IconBox />}
        label="Products in catalog"
        value={productTotal != null ? String(productTotal) : '—'}
        delta={productsDelta}
        subtitle="Active listings"
        loading={loading}
      />

      <KpiCard
        icon={<IconReceipt />}
        label="Avg. order value"
        value={avgOrderValue != null ? formatPrice(Math.round(avgOrderValue)) : '—'}
        delta={aovDelta}
        subtitle={orderCount > 0 ? `Based on ${orderCount} order${orderCount !== 1 ? 's' : ''}` : 'No orders yet'}
        loading={loading}
      />
    </ul>
  );
}
