/**
 * Admin Orders page.
 *
 * NOTE: GET /orders/ returns only the authenticated user's orders. There is
 * no admin-level endpoint to list all users' orders. This page surfaces that
 * limitation via a banner.
 *
 * TODO: Update when backend adds a role-gated GET /admin/orders endpoint.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';

import { listOrders } from '@/lib/api/orders';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { useDebounce } from '@/hooks/useDebounce';
import {
  EmptyState,
  ErrorMessage,
  PageHeader,
  PageLoader,
  SearchInput,
  SegmentedControl,
  StatCard,
  StatusPill,
} from '@/components/ui';
import { IconDownload, IconReceipt } from '@/components/layout/icons';
import type { Order } from '@/lib/api/types';

type Filter = 'all' | '7d' | '30d' | '90d';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: '7d',  label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
];

export function AdminOrdersPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);

  const { data: orders = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: listOrders,
  });

  const filtered = useMemo(() => {
    let xs = orders;
    if (filter !== 'all') {
      const days = filter === '7d' ? 7 : filter === '30d' ? 30 : 90;
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      xs = xs.filter((o) => new Date(o.order_date).getTime() >= cutoff);
    }
    if (search) {
      const q = search.toLowerCase();
      xs = xs.filter((o) => String(o.id).includes(q));
    }
    return xs;
  }, [orders, filter, search]);

  const stats = useMemo(() => {
    const total = filtered.reduce((sum, o) => sum + (o.total_amount ?? 0), 0);
    const units = filtered.reduce(
      (sum, o) => sum + (o.items ?? []).reduce((s, it) => s + (it.quantity ?? 0), 0),
      0,
    );
    return { count: filtered.length, total, units };
  }, [filtered]);

  return (
    <div className="flex flex-col gap-6 page-enter">
      <PageHeader
        title="Orders"
        subtitle="All orders placed under your account."
        actions={
          <button
            type="button"
            className="h-10 px-4 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
          >
            <IconDownload width={16} height={16} />
            Export CSV
          </button>
        }
      />

      {/* Scope notice */}
      <div className="rounded-[var(--radius-md)] bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
        <strong>Scope notice:</strong>{' '}
        <code className="px-1 py-0.5 rounded bg-white/60 font-mono text-xs">GET /orders</code>{' '}
        returns only the authenticated user's orders. A role-gated admin
        endpoint will surface store-wide orders here.
      </div>

      {/* Stats strip */}
      <ul className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <StatCard variant="mini" label="Orders" value={String(stats.count)} />
        <StatCard variant="mini" label="Revenue" value={formatPrice(stats.total)} />
        <StatCard variant="mini" label="Units sold" value={String(stats.units)} />
      </ul>

      {/* Toolbar */}
      <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-3 flex flex-wrap items-center gap-3">
        <SearchInput
          placeholder="Search by order ID…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search orders"
          className="flex-1 min-w-[14rem]"
        />
        <SegmentedControl
          ariaLabel="Filter by date"
          value={filter}
          onChange={setFilter}
          options={FILTERS}
        />
      </div>

      {/* States */}
      {isLoading && <PageLoader />}

      {isError && (
        <ErrorMessage
          message={(error as Error)?.message ?? 'Failed to load orders.'}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && (
        <>
          {filtered.length === 0 ? (
            <EmptyOrders />
          ) : (
            <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" role="table">
                  <thead>
                    <tr className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border-subtle)]">
                      <Th>Order</Th>
                      <Th>Date</Th>
                      <Th align="right">Items</Th>
                      <Th align="right">Total</Th>
                      <Th>Status</Th>
                      <Th>{''}</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order) => (
                      <OrderRow key={order.id} order={order} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

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

function OrderRow({ order }: { order: Order }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const totalQty = items.reduce((s, it) => s + (it.quantity ?? 0), 0);
  return (
    <tr className="border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-brand-subtle)]/40 transition-colors">
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-9 h-9 rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand)] text-xs font-bold flex-shrink-0">
            #{order.id}
          </span>
          <span className="text-sm font-semibold text-[var(--color-ink)]">
            Order #{order.id}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 align-middle text-sm text-[var(--color-ink-secondary)] whitespace-nowrap">
        {formatDate(order.order_date)}
      </td>
      <td className="px-4 py-3 align-middle text-right text-sm font-semibold text-[var(--color-ink)] tabular-nums whitespace-nowrap">
        {items.length} <span className="text-[var(--color-ink-muted)] font-normal">· {totalQty} unit{totalQty === 1 ? '' : 's'}</span>
      </td>
      <td className="px-4 py-3 align-middle text-right text-sm font-extrabold text-[var(--color-promo)] tabular-nums whitespace-nowrap">
        {formatPrice(order.total_amount)}
      </td>
      <td className="px-4 py-3 align-middle">
        {/* UI-only status (backend has no column). */}
        <StatusPill tone="success">Placed</StatusPill>
      </td>
      <td className="px-4 py-3 align-middle text-right">
        <Link
          to={`/orders/${order.id}`}
          className="inline-flex items-center gap-1 h-8 px-3 rounded-md text-xs font-semibold text-[var(--color-brand)] hover:bg-[var(--color-brand-subtle)] transition-colors"
          aria-label={`View order #${order.id}`}
        >
          View →
        </Link>
      </td>
    </tr>
  );
}

function EmptyOrders() {
  return (
    <EmptyState
      Icon={IconReceipt}
      size="md"
      title="No orders found"
      description="Try changing the date filter or clearing the search."
    />
  );
}
