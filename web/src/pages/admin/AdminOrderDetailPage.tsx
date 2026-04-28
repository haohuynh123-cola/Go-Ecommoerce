import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getOrder } from '@/lib/api/orders';
import { formatDate, formatPrice } from '@/lib/utils/format';
import {
  Breadcrumb,
  ErrorMessage,
  GradientThumbnail,
  PageLoader,
} from '@/components/ui';
import { OrderStatusControl } from '@/components/orders/OrderStatusControl';
import { OrderStatusTimeline } from '@/components/orders/OrderStatusTimeline';
import { OrderActivityTimeline } from '@/components/orders/OrderActivityTimeline';
import type { OrderItem } from '@/lib/api/types';

export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);

  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: !isNaN(orderId),
  });

  const subtotal = useMemo(() => {
    if (!order) return 0;
    return (order.items ?? []).reduce((s, it) => s + (it.price ?? 0) * (it.quantity ?? 0), 0);
  }, [order]);

  if (isLoading) return <PageLoader />;

  if (isError || !order) {
    return (
      <div className="py-8">
        <ErrorMessage
          message={(error as Error)?.message ?? 'Order not found.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
  const totalQty = items.reduce((s, it) => s + (it.quantity ?? 0), 0);

  return (
    <div className="flex flex-col gap-6 page-enter">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Breadcrumb
          items={[
            { label: 'Admin',  to: '/admin' },
            { label: 'Orders', to: '/admin/orders' },
            { label: `#${order.id}` },
          ]}
        />
        <Link
          to="/admin/orders"
          className="inline-flex items-center justify-center h-8 px-3 rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-ink)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
        >
          ← Back to orders
        </Link>
      </div>

      {/* Header card */}
      <section className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-4 md:p-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4">
          <h1 className="text-base font-semibold tracking-tight text-[var(--color-ink)]">
            <span className="text-[var(--color-ink-muted)] font-medium">Order</span>{' '}
            <span className="tabular-nums">#{order.id}</span>
          </h1>
          <span className="text-xs text-[var(--color-ink-muted)]">
            Placed on{' '}
            <span className="font-medium text-[var(--color-ink-secondary)] tabular-nums">
              {formatDate(order.order_date)}
            </span>
          </span>
        </div>

        {/* Visual stepper showing the order's progression */}
        <OrderStatusTimeline currentStatus={order.status} />

        <hr className="my-4 border-t border-[var(--color-border-subtle)]" />

        {/* Live status control — shows current status pill + transition buttons */}
        <OrderStatusControl orderId={orderId} currentStatus={order.status} />
      </section>

      {/* Two-column body: items (left) + activity timeline (right) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left column: items */}
        <section
          className="lg:col-span-8 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] overflow-hidden"
          aria-labelledby="admin-items-heading"
        >
          <header className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
            <h2 id="admin-items-heading" className="text-sm font-semibold text-[var(--color-ink)]">
              Items
            </h2>
            <span className="text-xs text-[var(--color-ink-muted)]">
              {items.length} product{items.length === 1 ? '' : 's'} · {totalQty} unit{totalQty === 1 ? '' : 's'}
            </span>
          </header>

          <ul role="list" className="px-4">
            {items.length === 0 ? (
              <li className="py-6 text-sm text-[var(--color-ink-muted)] text-center">
                Item details are not available for this order.
              </li>
            ) : (
              items.map((item, idx) => (
                <li
                  key={`${item.product_id}-${idx}`}
                  className="flex items-center gap-3 py-2.5 border-b border-[var(--color-border-subtle)] last:border-0"
                >
                  {/* 40×40 thumbnail */}
                  <GradientThumbnail
                    id={item.product_id}
                    name={item.product?.name ?? '?'}
                    size="sm"
                  />

                  {/* Name + SKU */}
                  <div className="flex flex-col min-w-0 flex-1">
                    {item.product ? (
                      <Link
                        to={`/admin/products/${item.product.id}/edit`}
                        className="text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-brand)] transition-colors truncate"
                      >
                        {item.product.name}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-[var(--color-ink)] truncate">
                        Product #{item.product_id}
                      </span>
                    )}
                    {item.product?.sku && (
                      <span className="text-xs font-mono text-[var(--color-ink-muted)]">
                        {item.product.sku}
                      </span>
                    )}
                  </div>

                  {/* Qty × price */}
                  <span className="text-xs tabular-nums text-[var(--color-ink-muted)] whitespace-nowrap shrink-0">
                    {item.quantity} × {formatPrice(item.price)}
                  </span>

                  {/* Subtotal */}
                  <span className="text-sm font-semibold tabular-nums text-[var(--color-ink)] whitespace-nowrap shrink-0 min-w-[4.5rem] text-right">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Right column: activity timeline */}
        <aside className="lg:col-span-4" aria-label="Order activity">
          <OrderActivityTimeline activities={order.activities ?? []} />
        </aside>
      </div>

      {/* Summary at bottom — receipt-style breakdown with hero total */}
      <section
        className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] overflow-hidden"
        aria-label="Order summary"
      >
        <header className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Summary</h2>
          <span className="text-xs text-[var(--color-ink-muted)] tabular-nums">
            {items.length} product{items.length === 1 ? '' : 's'} · {totalQty} unit{totalQty === 1 ? '' : 's'}
          </span>
        </header>

        <div className="grid gap-0 md:grid-cols-[1fr_auto]">
          {/* Left: line-item breakdown */}
          <dl className="p-4 md:p-5 space-y-2 md:border-r border-[var(--color-border-subtle)]">
            <div className="flex justify-between items-baseline text-sm">
              <dt className="text-[var(--color-ink-secondary)]">Subtotal</dt>
              <dd className="font-medium text-[var(--color-ink)] tabular-nums">
                {formatPrice(subtotal)}
              </dd>
            </div>
            <div className="flex justify-between items-baseline text-sm">
              <dt className="text-[var(--color-ink-secondary)]">Shipping</dt>
              <dd>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-success)] bg-[var(--color-success-bg)] px-1.5 py-0.5 rounded">
                  Free
                </span>
              </dd>
            </div>
            <div className="flex justify-between items-baseline text-sm">
              <dt className="text-[var(--color-ink-secondary)]">Tax</dt>
              <dd className="text-[var(--color-ink-muted)] tabular-nums">—</dd>
            </div>
          </dl>

          {/* Right: hero total */}
          <div className="p-4 md:p-5 bg-[var(--color-surface-muted)] flex flex-col gap-1 min-w-[240px] justify-center">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-ink-muted)]">
              Order total
            </span>
            <span className="text-2xl md:text-[1.75rem] font-extrabold text-[var(--color-promo)] tracking-tight leading-none tabular-nums">
              {formatPrice(order.total_amount)}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
