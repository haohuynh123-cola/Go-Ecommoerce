import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';

import { getOrder } from '@/lib/api/orders';
import { addToCart } from '@/lib/api/cart';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { Breadcrumb, ErrorMessage, GradientThumbnail, PageLoader, StatusPill } from '@/components/ui';
import {
  IconHeadset,
  IconRefresh,
  IconShield,
  IconTruck,
} from '@/components/layout/icons';
import type { OrderItem } from '@/lib/api/types';

const STATUS_TIMELINE = [
  { key: 'placed',     label: 'Placed' },
  { key: 'confirmed',  label: 'Confirmed' },
  { key: 'shipped',    label: 'Shipped' },
  { key: 'delivered',  label: 'Delivered' },
] as const;

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const queryClient = useQueryClient();

  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: !isNaN(orderId),
  });

  const buyAgain = useMutation({
    mutationFn: async () => {
      if (!order) return;
      // Best-effort: re-add each item to the cart sequentially.
      for (const it of order.items ?? []) {
        await addToCart(it.product_id, it.quantity);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const subtotal = useMemo(() => {
    if (!order) return 0;
    return (order.items ?? []).reduce((s, it) => s + (it.price ?? 0) * (it.quantity ?? 0), 0);
  }, [order]);

  if (isLoading) return <PageLoader />;

  if (isError || !order) {
    return (
      <div className="container py-12">
        <ErrorMessage
          message={(error as Error)?.message ?? 'Order not found.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // UI-only progress — backend has no status column yet. Show "Placed" stage active.
  const activeStage = 0;
  const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
  const totalQty = items.reduce((s, it) => s + (it.quantity ?? 0), 0);

  return (
    <div className="py-8 md:py-10 page-enter">
      <div className="container">
        <Breadcrumb
          className="mb-5"
          items={[
            { label: 'Home',      to: '/' },
            { label: 'My orders', to: '/orders' },
            { label: `#${order.id}` },
          ]}
        />

        {/* Header card */}
        <section className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-5 md:p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-muted)]">
                Order
              </p>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--color-ink)]">
                #{order.id}
              </h1>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                Placed on{' '}
                <span className="font-semibold text-[var(--color-ink-secondary)]">
                  {formatDate(order.order_date)}
                </span>
              </p>
            </div>
            <StatusPill tone="success">{STATUS_TIMELINE[activeStage].label}</StatusPill>
          </div>

          {/* Status timeline (UI-only) */}
          <ol className="mt-6 grid grid-cols-4 gap-2" aria-label="Order progress">
            {STATUS_TIMELINE.map((s, i) => {
              const isDone = i <= activeStage;
              const isActive = i === activeStage;
              return (
                <li key={s.key} className="flex flex-col items-center gap-2 text-center min-w-0">
                  <div className="relative w-full flex items-center justify-center">
                    {/* connector */}
                    {i > 0 && (
                      <span
                        aria-hidden
                        className={clsx(
                          'absolute right-1/2 top-1/2 -translate-y-1/2 h-0.5 w-full',
                          i <= activeStage ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-border-subtle)]',
                        )}
                      />
                    )}
                    <span
                      className={clsx(
                        'relative z-[1] grid place-items-center w-8 h-8 rounded-full text-xs font-bold transition-colors',
                        isDone
                          ? 'bg-[var(--color-brand)] text-white'
                          : 'bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)] border border-[var(--color-border)]',
                        isActive && 'ring-4 ring-[var(--color-brand-subtle)]',
                      )}
                    >
                      {isDone ? '✓' : i + 1}
                    </span>
                  </div>
                  <span
                    className={clsx(
                      'text-[11px] sm:text-xs font-semibold truncate w-full',
                      isDone ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-muted)]',
                    )}
                  >
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ol>

          <p className="mt-4 text-xs text-[var(--color-ink-muted)] italic">
            Status tracking is a UI placeholder — the backend doesn't expose order statuses yet.
          </p>
        </section>

        {/* Two-column body */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Items */}
          <section
            className="lg:col-span-8 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] overflow-hidden"
            aria-labelledby="items-heading"
          >
            <header className="px-5 py-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
              <h2 id="items-heading" className="text-base font-bold text-[var(--color-ink)]">
                Items
              </h2>
              <span className="text-xs text-[var(--color-ink-muted)]">
                {items.length} product{items.length === 1 ? '' : 's'} · {totalQty} unit{totalQty === 1 ? '' : 's'}
              </span>
            </header>

            <ul role="list" className="divide-y divide-[var(--color-border-subtle)]">
              {items.length === 0 ? (
                <li className="p-6 text-sm text-[var(--color-ink-muted)] text-center">
                  Item details are not available for this order.
                </li>
              ) : (
                items.map((item, idx) => (
                  <li
                    key={`${item.product_id}-${idx}`}
                    className="grid gap-4 p-4 sm:p-5 sm:grid-cols-[5rem_1fr_auto] items-start"
                  >
                    {/* Image placeholder */}
                    <GradientThumbnail
                      id={item.product_id}
                      name={item.product?.name ?? '?'}
                      size="lg"
                    />

                    {/* Info */}
                    <div className="flex flex-col gap-1 min-w-0">
                      {item.product ? (
                        <Link
                          to={`/products/${item.product.id}`}
                          className="text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-brand)] transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                      ) : (
                        <p className="text-sm font-semibold text-[var(--color-ink)]">
                          Product #{item.product_id}
                        </p>
                      )}
                      {item.product?.sku && (
                        <p className="text-xs font-mono text-[var(--color-ink-muted)]">{item.product.sku}</p>
                      )}
                      <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                        {formatPrice(item.price)} <span className="text-[var(--color-border)]">·</span> each
                      </p>
                    </div>

                    {/* Qty + total */}
                    <div className="flex flex-col items-end gap-1 min-w-[7rem]">
                      <span className="inline-flex items-center h-6 px-2 rounded-md bg-[var(--color-surface-muted)] text-xs font-bold text-[var(--color-ink-secondary)]">
                        × {item.quantity}
                      </span>
                      <span className="text-base font-extrabold text-[var(--color-promo)] tabular-nums">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>

          {/* Summary sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-32" aria-label="Order summary">
            <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-5">
              <h2 className="text-base font-bold text-[var(--color-ink)] tracking-tight">
                Summary
              </h2>

              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--color-ink-secondary)]">Subtotal</dt>
                  <dd className="font-semibold text-[var(--color-ink)]">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-ink-secondary)]">Shipping</dt>
                  <dd className="font-semibold text-[var(--color-success)]">Free</dd>
                </div>
              </dl>

              <hr className="my-4 border-t border-[var(--color-border-subtle)]" />

              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-[var(--color-ink)]">Order total</span>
                <span className="text-2xl font-extrabold text-[var(--color-promo)] tracking-tight">
                  {formatPrice(order.total_amount)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => buyAgain.mutate()}
                disabled={buyAgain.isPending || items.length === 0}
                className="mt-5 w-full h-12 rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-bold shadow-[var(--shadow-sm)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {buyAgain.isPending ? 'Adding…' : buyAgain.isSuccess ? 'Added to cart ✓' : 'Buy again'}
              </button>

              <Link
                to="/orders"
                className="mt-2 grid place-items-center h-11 rounded-[var(--radius-md)] bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
              >
                View all orders
              </Link>
            </div>

            {/* Help card */}
            <div className="rounded-[var(--radius-lg)] bg-[var(--color-sidebar)] text-white p-5">
              <h3 className="text-sm font-bold">Need help with this order?</h3>
              <p className="mt-1.5 text-xs text-white/65 leading-relaxed">
                Our team is available 24/7 to help with delivery, returns, or warranty.
              </p>
              <a
                href="tel:18001234"
                className="mt-3 grid place-items-center h-10 rounded-[var(--radius-md)] bg-white/10 hover:bg-white/15 border border-white/15 text-sm font-semibold transition-colors"
              >
                Call 1800 1234
              </a>
            </div>

            {/* Trust mini-strip */}
            <ul className="grid grid-cols-2 gap-2">
              {[
                { Icon: IconTruck,   t: 'Free shipping' },
                { Icon: IconRefresh, t: '30-day returns' },
                { Icon: IconShield,  t: '2-yr warranty' },
                { Icon: IconHeadset, t: '24/7 support' },
              ].map(({ Icon, t }) => (
                <li
                  key={t}
                  className="flex items-center gap-2 p-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-xs font-medium text-[var(--color-ink-secondary)]"
                >
                  <Icon width={16} height={16} className="text-[var(--color-brand)] flex-shrink-0" />
                  <span className="truncate">{t}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
