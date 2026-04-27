import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listOrders } from '@/lib/api/orders';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import type { Order } from '@/lib/api/types';

export function OrdersPage() {
  const { data: orders = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: listOrders,
  });

  return (
    <div className="py-12 pb-[var(--space-section)] page-enter">
      <div className="container">
        <header className="border-b border-[var(--color-border-subtle)] pb-6 mb-10">
          <p className="kicker">Account</p>
          <h1 className="page-title">Your Orders</h1>
        </header>

        {isLoading && <PageLoader />}

        {isError && (
          <ErrorMessage
            message={(error as Error)?.message ?? 'Failed to load orders.'}
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-4 text-[var(--color-ink-muted)] text-[length:var(--text-sm)] tracking-[var(--tracking-wide)] uppercase">
            <p>No orders yet.</p>
            <Link
              to="/"
              className="text-[length:var(--text-xs)] tracking-[var(--tracking-widest)] text-[var(--color-ink)] underline underline-offset-[3px] decoration-[1px] hover:opacity-60 transition-opacity"
            >
              Start shopping
            </Link>
          </div>
        )}

        {!isLoading && !isError && orders.length > 0 && (
          <ul className="flex flex-col" role="list">
            {orders.map((order: Order) => (
              <li key={order.id}>
                <Link
                  to={`/orders/${order.id}`}
                  className="grid items-center gap-6 py-5 border-b border-[var(--color-border-subtle)] no-underline group hover:bg-[var(--color-surface-raised)] -mx-4 px-4 rounded-[var(--radius-sm)] transition-colors duration-[var(--duration-normal)]"
                  style={{ gridTemplateColumns: 'auto 1fr 1fr 1fr auto auto' }}
                >
                  <div>
                    <p className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)] mb-0.5">Order</p>
                    <p className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-[var(--color-ink)]">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)] mb-0.5">Placed</p>
                    <p className="text-[length:var(--text-sm)] text-[var(--color-ink)]">{formatDate(order.order_date)}</p>
                  </div>
                  <div>
                    <p className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)] mb-0.5">Items</p>
                    <p className="text-[length:var(--text-sm)] text-[var(--color-ink)]">
                      {Array.isArray(order.items) ? order.items.length : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)] mb-0.5">Total</p>
                    <p className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-[var(--color-ink)]">
                      {formatPrice(order.total_amount)}
                    </p>
                  </div>
                  {/* UI-only placeholder — backend has no status column */}
                  <span className="order-status-pill">Placed</span>
                  <span className="text-[var(--color-ink-muted)] group-hover:translate-x-1 transition-transform duration-[var(--duration-normal)]" aria-hidden="true">
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
