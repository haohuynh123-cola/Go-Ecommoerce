import { Link } from 'react-router-dom';

import { Skeleton, StatusPill } from '@/components/ui';
import { formatDate, formatPrice } from '@/lib/utils/format';
import type { Order } from '@/lib/api/types';

interface RecentOrdersPanelProps {
  orders: Order[];
  viewAllHref?: string;
  /** When true, renders 5 skeleton rows instead of real order data. */
  loading?: boolean;
}

export function RecentOrdersPanel({
  orders,
  viewAllHref = '/admin/orders',
  loading = false,
}: RecentOrdersPanelProps) {
  return (
    <section className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)]">
      <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <h2 className="text-base font-bold text-[var(--color-ink)]">Recent orders</h2>
          <p className="text-xs text-[var(--color-ink-muted)]">
            Latest 5 orders across your account.
          </p>
        </div>
        <Link
          to={viewAllHref}
          className="text-xs font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] transition-colors"
        >
          View all →
        </Link>
      </header>

      {loading ? (
        <ul role="list" aria-label="Loading recent orders" className="divide-y divide-[var(--color-border-subtle)]">
          {Array.from({ length: 5 }, (_, i) => (
            <RecentOrderRowSkeleton key={i} />
          ))}
        </ul>
      ) : orders.length === 0 ? (
        <div className="p-8 text-center text-sm text-[var(--color-ink-muted)]">
          No orders yet. Once orders are placed they'll show up here.
        </div>
      ) : (
        <ul role="list" className="divide-y divide-[var(--color-border-subtle)]">
          {orders.map((order) => (
            <RecentOrderRow key={order.id} order={order} />
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
//
// Mirrors the 4-column grid of RecentOrderRow:
//   [avatar circle] [two text lines] [status pill] [total]
//
function RecentOrderRowSkeleton() {
  return (
    <li
      aria-hidden="true"
      className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-5 py-4"
    >
      {/* Avatar circle */}
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      {/* Two text lines */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      {/* Status pill */}
      <Skeleton className="h-5 w-14 rounded-full" />
      {/* Total */}
      <Skeleton className="h-4 w-12" />
    </li>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────
interface RecentOrderRowProps {
  order: Order;
}

export function RecentOrderRow({ order }: RecentOrderRowProps) {
  const items = Array.isArray(order.items) ? order.items : [];
  return (
    <li>
      <Link
        to={`/admin/orders/${order.id}`}
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
