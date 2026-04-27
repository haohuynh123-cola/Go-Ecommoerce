import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCartItems, updateCartItem, removeCartItem, clearCart } from '@/lib/api/cart';
import { createOrder } from '@/lib/api/orders';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { ErrorMessage, InlineError } from '@/components/ui/ErrorMessage';
import type { CartItem } from '@/lib/api/types';

export function CartPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [checkoutError, setCheckoutError] = useState('');

  const { data: items = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: getCartItems,
  });

  const updateMutation = useMutation({
    mutationFn: ({ product_id, quantity }: { product_id: number; quantity: number }) =>
      updateCartItem(product_id, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  // Real POST /cart/remove — no more quantity=0 workaround
  const removeMutation = useMutation({
    mutationFn: (product_id: number) => removeCartItem(product_id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  // POST /cart/clear — wipes all items for the authenticated user
  const clearMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const checkoutMutation = useMutation({
    mutationFn: () =>
      createOrder({
        // CartItem.product.id is the canonical product identifier
        items: items.map((i: CartItem) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
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

  // quantity must be >= 1 — backend rejects 0 with 400
  function handleQuantityChange(product_id: number, newQty: number) {
    if (newQty < 1) return;
    updateMutation.mutate({ product_id, quantity: newQty });
  }

  const total = items.reduce((acc: number, item: CartItem) => {
    return acc + item.product.price * item.quantity;
  }, 0);

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <div className="container" style={{ paddingBlock: 'var(--spacing-12)' }}>
        <ErrorMessage
          message={(error as Error)?.message ?? 'Failed to load cart.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="py-12 pb-[var(--space-section)] page-enter">
      <div className="container">
        <header className="border-b border-[var(--color-border-subtle)] pb-6 mb-10">
          <p className="kicker">Shopping</p>
          <h1 className="page-title">Your Cart</h1>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4 text-[var(--color-ink-muted)] text-[length:var(--text-sm)] tracking-[var(--tracking-wide)] uppercase">
            <p>Your cart is empty.</p>
            <Link
              to="/"
              className="text-[length:var(--text-xs)] tracking-[var(--tracking-widest)] uppercase text-[var(--color-ink)] underline underline-offset-[3px] decoration-[1px] hover:opacity-60 transition-opacity"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div
            className="grid gap-12 items-start"
            style={{ gridTemplateColumns: '1fr 20rem' }}
          >
            {/* Items */}
            <section aria-label="Cart items">
              <div className="flex justify-end mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearMutation.mutate()}
                  isLoading={clearMutation.isPending}
                >
                  Clear cart
                </Button>
              </div>
              <ul
                className="flex flex-col border-t border-[var(--color-border-subtle)]"
                role="list"
              >
                {items.map((item: CartItem) => (
                  <li
                    key={item.product.id}
                    className="grid gap-6 items-center py-5 border-b border-[var(--color-border-subtle)]"
                    style={{ gridTemplateColumns: '1fr auto auto auto' }}
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-[length:var(--text-xs)] tracking-[var(--tracking-widest)] uppercase text-[var(--color-ink-muted)]">
                        {item.product.sku}
                      </p>
                      <h2
                        className="text-[length:var(--text-md)] font-[var(--font-weight-normal)] text-[var(--color-ink)]"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {item.product.name}
                      </h2>
                      <p className="text-[length:var(--text-xs)] text-[var(--color-ink-muted)]">
                        {formatPrice(item.product.price)} each
                      </p>
                    </div>

                    <div
                      className="flex items-center gap-3 border border-[var(--color-border)] rounded-[var(--radius-sm)] px-2 py-1"
                    >
                      <button
                        className="w-6 h-6 flex items-center justify-center text-[length:var(--text-md)] text-[var(--color-ink-secondary)] bg-transparent border-none cursor-pointer rounded-[var(--radius-sm)] hover:text-[var(--color-ink)] hover:bg-[var(--color-accent-subtle)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                        disabled={updateMutation.isPending || item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        &minus;
                      </button>
                      <span className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)] min-w-[2ch] text-center text-[var(--color-ink)]">
                        {item.quantity}
                      </span>
                      <button
                        className="w-6 h-6 flex items-center justify-center text-[length:var(--text-md)] text-[var(--color-ink-secondary)] bg-transparent border-none cursor-pointer rounded-[var(--radius-sm)] hover:text-[var(--color-ink)] hover:bg-[var(--color-accent-subtle)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                        disabled={updateMutation.isPending}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-[length:var(--text-base)] font-[var(--font-weight-medium)] text-[var(--color-ink)] min-w-[8rem] text-right">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>

                    <button
                      className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)] bg-transparent border-none cursor-pointer px-2 py-1 hover:text-[var(--color-error)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={() => removeMutation.mutate(item.product.id)}
                      disabled={removeMutation.isPending}
                      aria-label={`Remove ${item.product.name} from cart`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* Summary */}
            <aside
              className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 flex flex-col gap-4"
              style={{ position: 'sticky', top: 'calc(3.5rem + 1rem)' }}
              aria-label="Order summary"
            >
              <h2
                className="text-[length:var(--text-lg)] font-[var(--font-weight-normal)] text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Summary
              </h2>
              <div className="flex justify-between text-[length:var(--text-sm)] text-[var(--color-ink-secondary)]">
                <span>Items ({items.length})</span>
                <span>{formatPrice(total)}</span>
              </div>
              <hr className="border-none border-t border-[var(--color-border-subtle)]" />
              <div className="flex justify-between text-[length:var(--text-md)] font-[var(--font-weight-semibold)] text-[var(--color-ink)]">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {checkoutError && <InlineError message={checkoutError} />}

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => {
                  setCheckoutError('');
                  checkoutMutation.mutate();
                }}
                isLoading={checkoutMutation.isPending}
                disabled={items.length === 0}
              >
                Checkout
              </Button>

              <p className="text-[length:var(--text-xs)] text-[var(--color-ink-muted)] leading-[var(--leading-normal)]">
                Checkout places an order directly. No payment is collected in this demo.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
