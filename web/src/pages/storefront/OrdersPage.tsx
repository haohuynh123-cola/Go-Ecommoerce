import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { listOrders } from '@/lib/api/orders';
import { formatDate, formatPrice } from '@/lib/utils/format';
import {
  Breadcrumb,
  EmptyState,
  ErrorMessage,
  GradientThumbnail,
  PageHeader,
  PageLoader,
  SegmentedControl,
  StatCard,
  StatusPill,
} from '@/components/ui';
import { IconCart } from '@/components/layout/icons';
import type { Order, OrderItem } from '@/lib/api/types';

type Filter = 'all' | '30d' | '90d';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

export function OrdersPage() {
  const [filter, setFilter] = useState<Filter>('all');

  const { data: orders = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: listOrders,
  });

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    const days = filter === '30d' ? 30 : 90;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return orders.filter((o) => {
      const t = new Date(o.order_date).getTime();
      return Number.isFinite(t) && t >= cutoff;
    });
  }, [orders, filter]);

  const stats = useMemo(() => {
    if (orders.length === 0) {
      return { total: 0, spent: 0, last: null as string | null };
    }
    const spent = orders.reduce((sum, o) => sum + (o.total_amount ?? 0), 0);
    const last = [...orders]
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())[0];
    return { total: orders.length, spent, last: last?.order_date ?? null };
  }, [orders]);

  return (
    <div className="py-8 md:py-10 page-enter">
      <div className="container">
        <Breadcrumb
          className="mb-5"
          items={[{ label: 'Home', to: '/' }, { label: 'My orders' }]}
        />
        <PageHeader
          className="mb-6"
          title="My orders"
          subtitle="Track every purchase you've made with Ecomm."
        />

        {isLoading && <PageLoader />}

        {isError && (
          <ErrorMessage
            message={(error as Error)?.message ?? 'Failed to load orders.'}
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && (
          <>
            {/* ─── Stats strip ───────────────────────────────── */}
            <ul className="grid gap-3 grid-cols-1 sm:grid-cols-3 mb-6">
              <StatCard variant="mini" label="Total orders" value={String(stats.total)} />
              <StatCard variant="mini" label="Total spent" value={formatPrice(stats.spent)} />
              <StatCard variant="mini" label="Last order" value={stats.last ? formatDate(stats.last) : '—'} />
            </ul>

            {/* ─── Filter chips ─────────────────────────────── */}
            {orders.length > 0 && (
              <SegmentedControl
                className="mb-6"
                variant="solid"
                ariaLabel="Filter orders by date range"
                value={filter}
                onChange={setFilter}
                options={FILTERS}
              />
            )}

            {/* ─── List ─────────────────────────────────────── */}
            {orders.length === 0 ? (
              <EmptyOrders />
            ) : filtered.length === 0 ? (
              <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center">
                <p className="text-sm text-[var(--color-ink-muted)]">
                  No orders match this filter.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3" role="list">
                {filtered.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
  const visible = items.slice(0, 4);
  const more = items.length - visible.length;
  const totalQty = items.reduce((sum, it) => sum + (it.quantity ?? 0), 0);

  return (
    <li>
      <Link
        to={`/orders/${order.id}`}
        className="group block rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-5 hover:border-[var(--color-brand)] hover:shadow-[var(--shadow-md)] transition-all"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--color-border-subtle)]">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-sm font-bold text-[var(--color-ink)]">
              Order <span className="text-[var(--color-brand)]">#{order.id}</span>
            </span>
            <span className="text-xs text-[var(--color-ink-muted)]">
              Placed {formatDate(order.order_date)}
            </span>
          </div>
          {/* UI-only — backend has no status column. */}
          <StatusPill tone="success">Placed</StatusPill>
        </div>

        {/* Body */}
        <div className="flex items-center gap-4 mt-4">
          {/* Thumbs */}
          <ul className="flex items-center -space-x-2 flex-shrink-0" role="list">
            {visible.map((it, idx) => (
              <li
                key={`${order.id}-${it.product_id}-${idx}`}
                className="ring-2 ring-[var(--color-surface)] rounded-full"
                title={it.product?.name ?? `Product #${it.product_id}`}
              >
                <GradientThumbnail
                  id={it.product_id}
                  name={it.product?.name ?? '?'}
                  size="md"
                  shape="round"
                />
              </li>
            ))}
            {more > 0 && (
              <li className="relative w-12 h-12 rounded-full ring-2 ring-[var(--color-surface)] bg-[var(--color-brand-subtle)] grid place-items-center text-xs font-bold text-[var(--color-brand)]">
                +{more}
              </li>
            )}
          </ul>

          {/* Summary */}
          <div className="flex-1 min-w-0 hidden md:block">
            <p className="text-sm text-[var(--color-ink-secondary)] truncate">
              {items.length > 0
                ? items.map((it) => it.product?.name ?? `#${it.product_id}`).join(' · ')
                : 'Item details unavailable'}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
              {items.length} product{items.length === 1 ? '' : 's'}
              {' · '}
              {totalQty} unit{totalQty === 1 ? '' : 's'}
            </p>
          </div>

          {/* Total */}
          <div className="text-right ml-auto">
            <p className="text-xs uppercase tracking-widest text-[var(--color-ink-muted)] font-semibold">Total</p>
            <p className="text-lg font-extrabold text-[var(--color-promo)] tabular-nums">
              {formatPrice(order.total_amount)}
            </p>
          </div>

          <span
            className="hidden sm:grid place-items-center w-8 h-8 rounded-full text-[var(--color-ink-muted)] group-hover:text-[var(--color-brand)] group-hover:translate-x-1 transition-all"
            aria-hidden
          >
            →
          </span>
        </div>
      </Link>
    </li>
  );
}

function EmptyOrders() {
  return (
    <EmptyState
      Icon={IconCart}
      title="No orders yet"
      description="Once you place an order it will show up here. Browse the latest deals to get started."
      actions={
        <Link
          to="/"
          className="h-11 px-6 grid place-items-center rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-semibold transition-colors"
        >
          Start shopping
        </Link>
      }
    />
  );
}
