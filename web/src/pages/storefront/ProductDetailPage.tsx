import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProduct } from '@/lib/api/products';
import { addToCart } from '@/lib/api/cart';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { ErrorMessage, InlineError } from '@/components/ui/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState(1);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);

  const { data: product, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId),
    enabled: !isNaN(productId),
  });

  const addMutation = useMutation({
    mutationFn: () => addToCart(productId, quantity),
    onSuccess: () => {
      setAddSuccess(true);
      setAddError('');
      setTimeout(() => setAddSuccess(false), 2500);
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err: Error) => {
      setAddError(err.message ?? 'Could not add to cart.');
    },
  });

  if (isLoading) return <PageLoader />;

  if (isError || !product) {
    return (
      <div className="container" style={{ paddingBlock: 'var(--spacing-12)' }}>
        <ErrorMessage
          message={(error as Error)?.message ?? 'Product not found.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className="py-12 pb-[var(--space-section)] page-enter">
      <div className="container">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-2 mb-8 text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase"
          aria-label="Breadcrumb"
        >
          <Link
            to="/"
            className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            Products
          </Link>
          <span className="text-[var(--color-border)]" aria-hidden="true">/</span>
          <span className="text-[var(--color-ink)]">{product.name}</span>
        </nav>

        <article
          className="grid gap-12 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-8 shadow-[var(--shadow-sm)]"
          style={{ gridTemplateColumns: '1fr auto' }}
        >
          {/* Info */}
          <div className="flex flex-col gap-6">
            <header>
              <p className="kicker">{product.sku}</p>
              <h1
                className="text-[length:var(--text-3xl)] tracking-[var(--tracking-tight)] text-[var(--color-ink)] font-[var(--font-weight-normal)]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {product.name}
              </h1>
            </header>

            <p
              className="text-[length:var(--text-2xl)] font-[var(--font-weight-semibold)] text-[var(--color-ink)] tracking-[var(--tracking-tight)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {formatPrice(product.price)}
            </p>

            <p className="text-[length:var(--text-md)] text-[var(--color-ink-secondary)] leading-[var(--leading-normal)] max-w-[60ch]">
              {product.description}
            </p>

            <div>
              <Badge variant={isOutOfStock ? 'error' : 'success'}>
                {isOutOfStock ? 'Out of stock' : `${product.stock} in stock`}
              </Badge>
            </div>
          </div>

          {/* Add to cart */}
          <div className="flex flex-col gap-4 min-w-[16rem]">
            {isAuthenticated ? (
              <>
                <label
                  htmlFor="quantity"
                  className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)]"
                >
                  Quantity
                </label>
                <div className="flex gap-3">
                  <input
                    id="quantity"
                    type="number"
                    className="input w-20 text-center"
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    disabled={isOutOfStock}
                  />
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => addMutation.mutate()}
                    isLoading={addMutation.isPending}
                    disabled={isOutOfStock}
                  >
                    {addSuccess ? 'Added' : 'Add to cart'}
                  </Button>
                </div>
                {addError && <InlineError message={addError} />}
              </>
            ) : (
              <p className="text-[length:var(--text-sm)] text-[var(--color-ink-muted)]">
                <Link
                  to="/login"
                  className="text-[var(--color-ink)] underline underline-offset-[3px] decoration-[1px] hover:opacity-65 transition-opacity"
                >
                  Sign in
                </Link>{' '}
                to add this item to your cart.
              </p>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
