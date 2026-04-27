import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listProducts } from '@/lib/api/products';
import { addToCart } from '@/lib/api/cart';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/lib/utils/format';
import { Pagination } from '@/components/ui/Pagination';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import type { Product } from '@/lib/api/types';

const PAGE_SIZE = 12;

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [nameInput, setNameInput] = useState(searchParams.get('name') ?? '');
  const [skuInput, setSkuInput] = useState(searchParams.get('sku') ?? '');
  const page = Number(searchParams.get('page') ?? '1');

  const name = useDebounce(nameInput, 400);
  const sku = useDebounce(skuInput, 400);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['products', { name, sku, page }],
    queryFn: () => listProducts({ name, sku, page, page_size: PAGE_SIZE }),
  });

  function handlePageChange(newPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
  }

  function handleSearch() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nameInput) next.set('name', nameInput);
      else next.delete('name');
      if (skuInput) next.set('sku', skuInput);
      else next.delete('sku');
      next.set('page', '1');
      return next;
    });
  }

  return (
    <div className="py-12 pb-[var(--space-section)] page-enter">
      <div className="container">
        {/* Page header */}
        <header className="flex items-end justify-between border-b border-[var(--color-border-subtle)] pb-6 mb-10">
          <div>
            <p className="kicker">Catalogue</p>
            <h1 className="page-title">All Products</h1>
          </div>
          {data?.pagination && (
            <p className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)] mb-1">
              {data.pagination.total_items} item
              {data.pagination.total_items !== 1 ? 's' : ''}
            </p>
          )}
        </header>

        {/* Search bar */}
        <div className="flex gap-3 mb-10 flex-wrap">
          <input
            className="input flex-1 min-w-[12rem]"
            type="search"
            placeholder="Search by name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            aria-label="Filter by product name"
          />
          <input
            className="input flex-1 min-w-[12rem]"
            type="search"
            placeholder="Filter by SKU"
            value={skuInput}
            onChange={(e) => setSkuInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            aria-label="Filter by SKU"
          />
          <button className="btn btn--secondary btn--md" onClick={handleSearch} type="button">
            Search
          </button>
        </div>

        {isLoading && <PageLoader />}

        {isError && (
          <ErrorMessage
            message={(error as Error).message ?? 'Failed to load products.'}
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && data && (
          <>
            {data.data.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-4 text-[var(--color-ink-muted)] text-[length:var(--text-sm)] tracking-[var(--tracking-wide)] uppercase">
                <p>No products found.</p>
              </div>
            ) : (
              <ul
                className="grid gap-px bg-[var(--color-border-subtle)]"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))' }}
                role="list"
              >
                {data.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ul>
            )}

            <Pagination
              page={page}
              totalPages={data.pagination?.total_pages ?? 1}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<'idle' | 'added' | 'error'>('idle');

  const addMutation = useMutation({
    mutationFn: () => addToCart(product.id, 1),
    onSuccess: () => {
      setFeedback('added');
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
      window.setTimeout(() => setFeedback('idle'), 2000);
    },
    onError: () => {
      setFeedback('error');
      window.setTimeout(() => setFeedback('idle'), 2500);
    },
  });

  const isOutOfStock = product.stock === 0;

  function handleAdd(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${product.id}` } } });
      return;
    }
    addMutation.mutate();
  }

  const buttonLabel =
    feedback === 'added'
      ? 'Added'
      : feedback === 'error'
      ? 'Failed'
      : addMutation.isPending
      ? 'Adding…'
      : 'Add to cart';

  return (
    <li className="bg-[var(--color-surface)] flex flex-col">
      <Link
        to={`/products/${product.id}`}
        className="flex flex-col flex-1 p-6 no-underline group hover:bg-[var(--color-surface-raised)] transition-colors duration-[var(--duration-normal)]"
      >
        <div className="flex-1 flex flex-col gap-2">
          <p className="text-[length:var(--text-xs)] tracking-[var(--tracking-widest)] uppercase text-[var(--color-ink-muted)]">
            {product.sku}
          </p>
          <h2
            className="text-[length:var(--text-md)] font-[var(--font-weight-normal)] text-[var(--color-ink)] tracking-[var(--tracking-tight)] group-hover:translate-x-0.5 transition-transform duration-[var(--duration-normal)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {product.name}
          </h2>
          {product.description && (
            <p className="text-[length:var(--text-sm)] text-[var(--color-ink-muted)] leading-[var(--leading-normal)] line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--color-border-subtle)]">
          <span className="text-[length:var(--text-md)] font-[var(--font-weight-medium)] text-[var(--color-ink)]">
            {formatPrice(product.price)}
          </span>
          <span
            className={`text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase ${
              isOutOfStock ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]'
            }`}
          >
            {isOutOfStock ? 'Out of stock' : `${product.stock} in stock`}
          </span>
        </div>
      </Link>
      <div className="px-6 pb-6">
        <button
          type="button"
          className="btn btn--secondary btn--sm btn--full"
          onClick={handleAdd}
          disabled={isOutOfStock || addMutation.isPending}
          aria-live="polite"
        >
          {buttonLabel}
        </button>
      </div>
    </li>
  );
}
