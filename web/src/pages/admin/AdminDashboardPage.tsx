import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { listProducts } from '@/lib/api/products';
import { listOrders } from '@/lib/api/orders';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { PageHeader, StatCard, StatusPill } from '@/components/ui';
import {
  IconBox,
  IconReceipt,
  IconStore,
} from '@/components/layout/icons';
import type { Order } from '@/lib/api/types';

export function AdminDashboardPage() {
  const { data: productsSummary } = useQuery({
    queryKey: ['admin-products-summary'],
    queryFn: () => listProducts({ page: 1, page_size: 1 }),
  });
  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: listOrders,
  });

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

  const recent = [...orders]
    .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
    .slice(0, 5);

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

      {/* ─── KPI cards ─────────────────────────────────────── */}
      <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<IconReceipt width={20} height={20} />}
          label="Your orders"
          value={String(orders.length)}
          delta={{ direction: 'up', text: `+${last7DayOrders.length} this week` }}
        />
        <StatCard
          variant="accent"
          icon={<IconStore width={20} height={20} />}
          label="Revenue"
          value={formatPrice(totalRevenue)}
          delta={{ direction: orders.length > 0 ? 'up' : 'flat', text: 'Lifetime total' }}
        />
        <StatCard
          icon={<IconBox width={20} height={20} />}
          label="Products in catalog"
          value={String(productsSummary?.pagination?.total_items ?? '—')}
          delta={{ direction: 'flat', text: 'Across all categories' }}
        />
        <StatCard
          icon={<IconReceipt width={20} height={20} />}
          label="Avg. order value"
          value={orders.length > 0 ? formatPrice(Math.round(totalRevenue / orders.length)) : '—'}
          delta={{ direction: 'flat', text: 'Across your orders' }}
        />
      </ul>

      {/* ─── Two-column row: chart + activity ─────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Sparkline chart */}
        <div className="lg:col-span-2 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[var(--color-ink)] tracking-tight">
                Orders · last 14 days
              </h2>
              <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                Daily order count for your account.
              </p>
            </div>
            <span className="inline-flex items-baseline gap-1 text-2xl font-extrabold text-[var(--color-ink)] tracking-tight">
              {orders.length}
              <span className="text-xs font-semibold text-[var(--color-success)]">
                ↑ {last7DayOrders.length}
              </span>
            </span>
          </div>
          <Sparkline data={sparklineData} />
        </div>

        {/* Limitation notice */}
        <aside className="rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-brand-subtle)] to-[var(--color-promo-subtle)] border border-[var(--color-border-subtle)] p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-brand)]">
            Heads up
          </p>
          <h3 className="mt-2 text-base font-bold text-[var(--color-ink)] tracking-tight leading-snug">
            Admin order list reflects your orders only
          </h3>
          <p className="mt-2 text-sm text-[var(--color-ink-secondary)] leading-relaxed">
            <code className="inline px-1 py-0.5 rounded bg-white/60 font-mono text-xs">
              GET /orders
            </code>{' '}
            returns only the authenticated user's orders. A role-gated admin endpoint
            will surface store-wide orders here.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Link
              to="/admin/orders"
              className="h-9 px-3 grid place-items-center rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-ink)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
            >
              View orders
            </Link>
          </div>
        </aside>
      </div>

      {/* ─── Recent orders ──────────────────────────────────── */}
      <section className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)]">
        <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-subtle)]">
          <div>
            <h2 className="text-base font-bold text-[var(--color-ink)]">Recent orders</h2>
            <p className="text-xs text-[var(--color-ink-muted)]">Latest 5 orders across your account.</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] transition-colors"
          >
            View all →
          </Link>
        </header>

        {recent.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--color-ink-muted)]">
            No orders yet. Once orders are placed they'll show up here.
          </div>
        ) : (
          <ul role="list" className="divide-y divide-[var(--color-border-subtle)]">
            {recent.map((order) => (
              <RecentOrderRow key={order.id} order={order} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ─── Sparkline (CSS-only bars) ───────────────────────────────────
function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(1, ...data);
  return (
    <div className="mt-5 grid gap-1 grid-cols-14 items-end h-32" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
      {data.map((v, i) => {
        const height = Math.max(4, (v / max) * 100);
        const isLast = i === data.length - 1;
        return (
          <div key={i} className="relative h-full flex items-end">
            <span
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${height}%`,
                background: isLast
                  ? 'linear-gradient(to top, var(--color-brand), oklch(70% 0.16 252))'
                  : 'oklch(80% 0.10 252 / 0.55)',
              }}
              title={`${v} order${v === 1 ? '' : 's'}`}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── Recent order row ────────────────────────────────────────────
function RecentOrderRow({ order }: { order: Order }) {
  const items = Array.isArray(order.items) ? order.items : [];
  return (
    <li>
      <Link
        to={`/orders/${order.id}`}
        className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-5 py-4 hover:bg-[var(--color-surface-muted)] transition-colors"
      >
        <span className="grid place-items-center w-10 h-10 rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand)] text-xs font-bold">
          #{order.id}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
            {items.length} item{items.length === 1 ? '' : 's'}
          </p>
          <p className="text-xs text-[var(--color-ink-muted)]">
            {formatDate(order.order_date)}
          </p>
        </div>
        <StatusPill tone="success">Placed</StatusPill>
        <span className="text-base font-extrabold text-[var(--color-promo)] tabular-nums">
          {formatPrice(order.total_amount)}
        </span>
      </Link>
    </li>
  );
}
