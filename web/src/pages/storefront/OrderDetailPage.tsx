import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrder } from '@/lib/api/orders';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import type { OrderItem } from '@/lib/api/types';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);

  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: !isNaN(orderId),
  });

  if (isLoading) return <PageLoader />;

  if (isError || !order) {
    return (
      <div className="container" style={{ paddingBlock: 'var(--spacing-12)' }}>
        <ErrorMessage
          message={(error as Error)?.message ?? 'Order not found.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="py-12 pb-[var(--space-section)] page-enter">
      <div className="container">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-2 mb-8 text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase"
          aria-label="Breadcrumb"
        >
          <Link
            to="/orders"
            className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            Orders
          </Link>
          <span className="text-[var(--color-border)]" aria-hidden="true">/</span>
          <span className="text-[var(--color-ink)]">#{order.id}</span>
        </nav>

        <article className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] overflow-hidden">
          {/* Header */}
          <header className="flex items-start justify-between p-8 border-b border-[var(--color-border-subtle)]">
            <div>
              <p className="kicker">Order #{order.id}</p>
              <h1 className="page-title">Order details</h1>
            </div>
            {/* UI-only placeholder — backend has no status column */}
            <span className="order-status-pill mt-1">Placed</span>
          </header>

          {/* Meta */}
          <div className="grid gap-8 p-8 border-b border-[var(--color-border-subtle)]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))' }}>
            <div>
              <p className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)] mb-1">Placed</p>
              <p className="text-[length:var(--text-md)] text-[var(--color-ink)]">{formatDate(order.order_date)}</p>
            </div>
            <div>
              <p className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)] mb-1">Total</p>
              <p
                className="text-[length:var(--text-md)] font-[var(--font-weight-semibold)] text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {formatPrice(order.total_amount)}
              </p>
            </div>
          </div>

          {/* Items */}
          <section className="p-8" aria-labelledby="items-heading">
            <h2
              className="text-[length:var(--text-xs)] tracking-[var(--tracking-widest)] uppercase text-[var(--color-ink-muted)] mb-6"
              id="items-heading"
            >
              Items
            </h2>
            <ul className="flex flex-col" role="list">
              {Array.isArray(order.items) && order.items.length > 0 ? (
                order.items.map((item: OrderItem, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-center gap-6 py-4 border-b border-[var(--color-border-subtle)] last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-[length:var(--text-md)] text-[var(--color-ink)]">
                        {item.product?.name ?? `Product #${item.product_id}`}
                      </p>
                      {item.product?.sku && (
                        <p className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)] mt-0.5">
                          {item.product.sku}
                        </p>
                      )}
                    </div>
                    <span className="text-[length:var(--text-sm)] text-[var(--color-ink-muted)]">
                      &times; {item.quantity}
                    </span>
                    <span className="text-[length:var(--text-md)] font-[var(--font-weight-medium)] text-[var(--color-ink)] min-w-[8rem] text-right">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))
              ) : (
                <li className="py-4 text-[length:var(--text-sm)] text-[var(--color-ink-muted)]">
                  Item details not available.
                </li>
              )}
            </ul>

            <div className="flex justify-between items-center pt-6 mt-2 border-t border-[var(--color-border)]">
              <span className="text-[length:var(--text-xs)] tracking-[var(--tracking-widest)] uppercase text-[var(--color-ink-muted)]">Total</span>
              <span
                className="text-[length:var(--text-xl)] font-[var(--font-weight-semibold)] text-[var(--color-ink)] tracking-[var(--tracking-tight)]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
