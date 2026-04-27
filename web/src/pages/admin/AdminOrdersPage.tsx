/**
 * Admin Orders page.
 *
 * NOTE: The backend's GET /orders/ only returns orders belonging to the
 * currently authenticated user. There is no admin-level endpoint to list
 * all users' orders. This page surfaces that limitation via a banner.
 *
 * TODO: Update this page when the backend adds a role-gated
 * GET /admin/orders endpoint.
 */
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listOrders } from '@/lib/api/orders';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import type { Order } from '@/lib/api/types';

export function AdminOrdersPage() {
  const { data: orders = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: listOrders,
  });

  return (
    <div className="flex flex-col gap-6 page-enter">
      <header className="flex items-end justify-between flex-wrap gap-4 border-b border-[var(--color-border-subtle)] pb-6">
        <div>
          <p className="kicker">Transactions</p>
          <h1 className="page-title">Orders</h1>
        </div>
      </header>

      {/* Honest limitation notice */}
      <div className="bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] rounded-[var(--radius-md)] px-5 py-4 text-[length:var(--text-sm)] text-[var(--color-warning-text)] leading-[var(--leading-normal)]">
        <strong>Scope notice:</strong> The backend returns only orders for the
        currently authenticated user. A global order list is not available until
        the backend implements a role-gated admin endpoint.
      </div>

      {isLoading && <PageLoader />}

      {isError && (
        <ErrorMessage
          message={(error as Error)?.message ?? 'Failed to load orders.'}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <div className="py-12 text-center text-[length:var(--text-sm)] text-[var(--color-ink-muted)] tracking-[var(--tracking-wide)] uppercase">
          No orders found for this account.
        </div>
      )}

      {!isLoading && !isError && orders.length > 0 && (
        <div className="overflow-x-auto border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-surface-raised)]">
          <table className="w-full border-collapse text-[length:var(--text-sm)]" role="table">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th
                  scope="col"
                  className="text-left px-4 py-3 text-[length:var(--text-xs)] font-[var(--font-weight-medium)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)] whitespace-nowrap"
                >
                  Order ID
                </th>
                <th
                  scope="col"
                  className="text-left px-4 py-3 text-[length:var(--text-xs)] font-[var(--font-weight-medium)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)]"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="text-left px-4 py-3 text-[length:var(--text-xs)] font-[var(--font-weight-medium)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)]"
                >
                  Items
                </th>
                <th
                  scope="col"
                  className="text-left px-4 py-3 text-[length:var(--text-xs)] font-[var(--font-weight-medium)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)]"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="text-left px-4 py-3 text-[length:var(--text-xs)] font-[var(--font-weight-medium)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)]"
                >
                  {/* UI-only column — backend has no status column */}
                  Status
                </th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: Order) => (
                <tr
                  key={order.id}
                  className="border-b border-[var(--color-border-subtle)] last:border-0 hover:bg-[var(--color-accent-subtle)] transition-colors duration-[var(--duration-fast)]"
                >
                  <td className="px-4 py-3 font-[var(--font-weight-medium)] text-[var(--color-ink)] align-middle whitespace-nowrap">
                    #{order.id}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-secondary)] align-middle">
                    {formatDate(order.order_date)}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-secondary)] align-middle">
                    {Array.isArray(order.items) ? order.items.length : '—'}
                  </td>
                  <td className="px-4 py-3 font-[var(--font-weight-medium)] text-[var(--color-ink)] align-middle">
                    {formatPrice(order.total_amount)}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {/* UI-only placeholder — backend has no status column */}
                    <Badge variant="default">Placed</Badge>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-secondary)] no-underline hover:text-[var(--color-accent)] transition-colors duration-[var(--duration-normal)]"
                      aria-label={`View order #${order.id}`}
                    >
                      View &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
