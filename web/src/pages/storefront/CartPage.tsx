import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  clearCart,
  getCartItems,
  removeCartItem,
  updateCartItem,
} from '@/lib/api/cart';
import { createOrder } from '@/lib/api/orders';
import { formatPrice } from '@/lib/utils/format';
import {
  Breadcrumb,
  EmptyState,
  ErrorMessage,
  GradientThumbnail,
  InlineError,
  PageHeader,
  PageLoader,
} from '@/components/ui';

import {
  IconCart,
  IconHeadset,
  IconRefresh,
  IconShield,
  IconTruck,
} from '@/components/layout/icons';
import type { CartItem } from '@/lib/api/types';

// UI-only threshold for free-shipping nudge — adjust when backend exposes shipping rules.
const FREE_SHIPPING_THRESHOLD = 500_000;

export function CartPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [checkoutError, setCheckoutError] = useState('');
  const [promo, setPromo] = useState('');
  const [promoNote, setPromoNote] = useState<{ ok: boolean; msg: string } | null>(null);

  const { data: items = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: getCartItems,
  });

  const updateMutation = useMutation({
    mutationFn: ({ product_id, quantity }: { product_id: number; quantity: number }) =>
      updateCartItem(product_id, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (product_id: number) => removeCartItem(product_id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const clearMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const checkoutMutation = useMutation({
    mutationFn: () =>
      createOrder({
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      }),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate(`/orders/${order.id}`);
    },
    onError: (err: Error) => {
      setCheckoutError(err.message ?? 'Checkout failed. Please try again.');
    },
  });

  function handleQuantityChange(product_id: number, newQty: number) {
    if (newQty < 1) return;
    updateMutation.mutate({ product_id, quantity: newQty });
  }

  function applyPromo() {
    // TODO: wire to backend. For now, accept "WELCOME10" as a demo code.
    if (!promo.trim()) {
      setPromoNote(null);
      return;
    }
    if (promo.trim().toUpperCase() === 'WELCOME10') {
      setPromoNote({ ok: true, msg: '10% off applied (demo only — not yet wired to the backend).' });
    } else {
      setPromoNote({ ok: false, msg: 'Invalid promo code.' });
    }
  }

  const subtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const itemCount = items.reduce((acc, it) => acc + it.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = freeShipping ? 0 : 30_000;
  const promoDiscount = promoNote?.ok ? Math.round(subtotal * 0.1) : 0;
  const total = Math.max(0, subtotal + shippingFee - promoDiscount);

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <div className="container py-12">
        <ErrorMessage
          message={(error as Error)?.message ?? 'Failed to load cart.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="py-8 md:py-10 page-enter">
      <div className="container">
        <Breadcrumb
          className="mb-5"
          items={[{ label: 'Home', to: '/' }, { label: 'Shopping cart' }]}
        />
        <PageHeader
          className="mb-6"
          title="Shopping cart"
          subtitle={items.length > 0 ? (
            <><span className="font-semibold text-[var(--color-ink)]">{itemCount}</span> item{itemCount === 1 ? '' : 's'} in cart</>
          ) : undefined}
          actions={
            <Link
              to="/"
              className="text-sm text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] font-semibold inline-flex items-center gap-1"
            >
              ← Continue shopping
            </Link>
          }
        />

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* ─── Items column ─────────────────────────────────── */}
            <section
              className="lg:col-span-8 bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] overflow-hidden"
              aria-label="Cart items"
            >
              {/* Free shipping nudge */}
              <div className="px-5 py-4 border-b border-[var(--color-border-subtle)]">
                {freeShipping ? (
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-success)]">
                    <IconTruck width={18} height={18} />
                    You qualify for free shipping!
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-[var(--color-ink-secondary)]">
                      <IconTruck width={16} height={16} className="inline -mt-0.5 mr-1.5 text-[var(--color-brand)]" />
                      Add{' '}
                      <span className="font-bold text-[var(--color-brand)]">
                        {formatPrice(remainingForFreeShipping)}
                      </span>{' '}
                      more for <span className="font-semibold">free shipping</span>.
                    </p>
                    <div className="mt-2 h-1.5 rounded-full bg-[var(--color-border-subtle)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-brand)] transition-[width] duration-500"
                        style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Items list */}
              <ul role="list" className="divide-y divide-[var(--color-border-subtle)]">
                {items.map((item) => (
                  <CartItemRow
                    key={item.product.id}
                    item={item}
                    pendingUpdate={updateMutation.isPending}
                    pendingRemove={removeMutation.isPending}
                    onChangeQty={handleQuantityChange}
                    onRemove={(id) => removeMutation.mutate(id)}
                  />
                ))}
              </ul>

              {/* Footer actions */}
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)]">
                <button
                  type="button"
                  onClick={() => clearMutation.mutate()}
                  disabled={clearMutation.isPending}
                  className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-error)] disabled:opacity-50 transition-colors"
                >
                  {clearMutation.isPending ? 'Clearing…' : 'Clear cart'}
                </button>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  Prices include VAT where applicable.
                </p>
              </div>
            </section>

            {/* ─── Summary column ───────────────────────────────── */}
            <aside
              className="lg:col-span-4 lg:sticky lg:top-32 flex flex-col gap-4"
              aria-label="Order summary"
            >
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] p-5">
                <h2 className="text-base font-bold text-[var(--color-ink)] tracking-tight">
                  Order summary
                </h2>

                <dl className="mt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-ink-secondary)]">Subtotal ({itemCount} item{itemCount === 1 ? '' : 's'})</dt>
                    <dd className="font-semibold text-[var(--color-ink)]">{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-ink-secondary)]">Shipping</dt>
                    <dd className={freeShipping ? 'font-semibold text-[var(--color-success)]' : 'font-semibold text-[var(--color-ink)]'}>
                      {freeShipping ? 'Free' : formatPrice(shippingFee)}
                    </dd>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-[var(--color-ink-secondary)]">Promo (WELCOME10)</dt>
                      <dd className="font-semibold text-[var(--color-promo)]">−{formatPrice(promoDiscount)}</dd>
                    </div>
                  )}
                </dl>

                <hr className="my-4 border-t border-[var(--color-border-subtle)]" />

                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-[var(--color-ink)]">Total</span>
                  <span className="text-2xl font-extrabold text-[var(--color-promo)] tracking-tight">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Promo code */}
                <div className="mt-4">
                  <label htmlFor="promo" className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-muted)]">
                    Promo code
                  </label>
                  <div className="mt-1.5 flex items-stretch gap-2">
                    <input
                      id="promo"
                      type="text"
                      value={promo}
                      onChange={(e) => { setPromo(e.target.value); setPromoNote(null); }}
                      placeholder="WELCOME10"
                      className="flex-1 h-10 px-3 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-brand)] focus:bg-[var(--color-surface-raised)] focus:shadow-[var(--shadow-focus)] transition"
                    />
                    <button
                      type="button"
                      onClick={applyPromo}
                      className="h-10 px-4 rounded-[var(--radius-md)] bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoNote && (
                    <p className={`mt-2 text-xs ${promoNote.ok ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                      {promoNote.msg}
                    </p>
                  )}
                </div>

                {checkoutError && <div className="mt-3"><InlineError message={checkoutError} /></div>}

                <button
                  type="button"
                  onClick={() => { setCheckoutError(''); checkoutMutation.mutate(); }}
                  disabled={items.length === 0 || checkoutMutation.isPending}
                  className="mt-5 w-full h-12 rounded-[var(--radius-md)] bg-[var(--color-promo)] hover:bg-[var(--color-promo-hover)] text-white text-sm font-bold shadow-[var(--shadow-sm)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {checkoutMutation.isPending ? 'Placing order…' : 'Proceed to checkout'}
                </button>

                <p className="mt-3 text-xs text-[var(--color-ink-muted)] leading-relaxed">
                  Checkout places an order directly. No payment is collected in this demo.
                </p>

                <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                  {['VISA', 'MC', 'AMEX', 'PayPal'].map((m) => (
                    <span
                      key={m}
                      className="grid place-items-center h-6 px-2 rounded-md bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] text-[10px] font-bold tracking-wider text-[var(--color-ink-muted)]"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trust mini-strip */}
              <ul className="grid grid-cols-2 gap-2">
                {[
                  { Icon: IconTruck,   t: 'Free shipping' },
                  { Icon: IconRefresh, t: '30-day returns' },
                  { Icon: IconShield,  t: 'Secure checkout' },
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
        )}
      </div>
    </div>
  );
}

interface CartItemRowProps {
  item: CartItem;
  pendingUpdate: boolean;
  pendingRemove: boolean;
  onChangeQty: (id: number, q: number) => void;
  onRemove: (id: number) => void;
}

function CartItemRow({ item, pendingUpdate, pendingRemove, onChangeQty, onRemove }: CartItemRowProps) {
  const { product, quantity } = item;
  const lineTotal = product.price * quantity;

  return (
    <li className="grid gap-4 p-4 sm:p-5 sm:grid-cols-[5rem_1fr_auto] items-start">
      {/* Image */}
      <Link
        to={`/products/${product.id}`}
        className="block flex-shrink-0"
        aria-label={product.name}
      >
        <GradientThumbnail id={product.id} name={product.name} size="lg" />
      </Link>

      {/* Info + actions */}
      <div className="flex flex-col gap-2 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/products/${product.id}`}
              className="block text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-brand)] transition-colors line-clamp-2"
            >
              {product.name}
            </Link>
            <p className="mt-0.5 text-xs font-mono text-[var(--color-ink-muted)]">{product.sku}</p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(product.id)}
            disabled={pendingRemove}
            className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-error)] disabled:opacity-50 transition-colors flex-shrink-0"
            aria-label={`Remove ${product.name}`}
          >
            Remove
          </button>
        </div>

        <p className="text-xs text-[var(--color-ink-muted)]">
          {formatPrice(product.price)} <span className="text-[var(--color-border)]">·</span> each
        </p>

        <div className="flex items-center justify-between gap-3 mt-1">
          {/* Qty stepper */}
          <div className="flex items-stretch h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] overflow-hidden">
            <button
              type="button"
              onClick={() => onChangeQty(product.id, quantity - 1)}
              disabled={pendingUpdate || quantity <= 1}
              className="w-8 grid place-items-center text-[var(--color-ink-secondary)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span
              className="w-10 grid place-items-center text-sm font-bold text-[var(--color-ink)] border-x border-[var(--color-border)]"
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onChangeQty(product.id, quantity + 1)}
              disabled={pendingUpdate}
              className="w-8 grid place-items-center text-[var(--color-ink-secondary)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Line total */}
          <span className="text-base font-extrabold text-[var(--color-promo)] tabular-nums">
            {formatPrice(lineTotal)}
          </span>
        </div>
      </div>
    </li>
  );
}

function EmptyCart() {
  return (
    <EmptyState
      Icon={IconCart}
      title="Your cart is empty"
      description="Browse our latest phones, laptops, and accessories to get started."
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
