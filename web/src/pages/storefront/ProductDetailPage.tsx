import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getProduct } from '@/lib/api/products';
import { addToCart } from '@/lib/api/cart';
import { formatPrice } from '@/lib/utils/format';
import { useAuth } from '@/hooks/useAuth';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import {
  getProductBadgeMock,
  getProductPlaceholderGradient,
  getProductPromoMock,
  getProductRatingMock,
} from '@/lib/utils/product';
import { Breadcrumb, ErrorMessage, InlineError, PageLoader } from '@/components/ui';
import {
  IconHeadset,
  IconRefresh,
  IconShield,
  IconTruck,
} from '@/components/layout/icons';
import { ProductComments } from '@/components/product/ProductComments/ProductComments';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { RecentlyViewed } from '@/components/product/RecentlyViewed';
import type { Product } from '@/lib/api/types';

const TRUST_ITEMS = [
  { Icon: IconTruck,   title: 'Free shipping',   sub: 'On orders over $99' },
  { Icon: IconRefresh, title: '30-day returns',  sub: 'No questions asked' },
  { Icon: IconShield,  title: '2-year warranty', sub: 'Manufacturer-backed' },
  { Icon: IconHeadset, title: '24/7 support',    sub: 'Expert help any time' },
];

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState(1);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);

  const { data: product, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId),
    enabled: !isNaN(productId),
  });

  // Cache the viewed product ID once it has resolved successfully.
  const { track: trackRecentlyViewed } = useRecentlyViewed();
  useEffect(() => {
    if (product?.id) trackRecentlyViewed(product.id);
  }, [product?.id, trackRecentlyViewed]);

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
      <div className="container py-12">
        <ErrorMessage
          message={(error as Error)?.message ?? 'Product not found.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const promo = getProductPromoMock(product);
  const rating = getProductRatingMock(product);
  const tag = getProductBadgeMock(product);
  const isOutOfStock = product.stock === 0;
  const stepperDisabled = isOutOfStock || addMutation.isPending;

  function handleQtyChange(delta: number) {
    setQuantity((q) => {
      if (!product) return q;
      const next = Math.max(1, Math.min(product.stock, q + delta));
      return next;
    });
  }

  async function handleBuyNow() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${productId}` } } });
      return;
    }
    try {
      await addMutation.mutateAsync();
      navigate('/cart');
    } catch {
      /* error already surfaced via state */
    }
  }

  function handleAdd() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${productId}` } } });
      return;
    }
    addMutation.mutate();
  }

  return (
    <div className="py-8 md:py-10 page-enter">
      <div className="container">
        <Breadcrumb
          className="mb-6"
          items={[
            { label: 'Home',     to: '/' },
            { label: 'Products', to: '/' },
            { label: product.name },
          ]}
        />

        {/* ─── Main two-column layout ───────────────────────── */}
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-12">
          {/* ─── Gallery ───────────────────────────────────── */}
          <ProductGallery product={product} activeThumb={activeThumb} onSelect={setActiveThumb} />

          {/* ─── Info column ───────────────────────────────── */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* Tag row */}
            <div className="flex flex-wrap items-center gap-2">
              {promo && (
                <span className="inline-flex items-center h-6 px-2 rounded-md bg-[var(--color-promo)] text-white text-[11px] font-bold tracking-wide">
                  -{promo.discountPct}% Sale
                </span>
              )}
              {tag === 'bestseller' && (
                <span className="inline-flex items-center h-6 px-2 rounded-md bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)] text-[11px] font-bold tracking-wide">
                  ★ Best seller
                </span>
              )}
              {tag === 'new' && (
                <span className="inline-flex items-center h-6 px-2 rounded-md bg-[var(--color-brand-subtle)] text-[var(--color-brand)] border border-[var(--color-brand)] text-[11px] font-bold tracking-wide">
                  NEW
                </span>
              )}
              <span className="ml-auto text-xs text-[var(--color-ink-muted)] font-mono">{product.sku}</span>
            </div>

            <h1 className="text-lg md:text-xl font-bold tracking-tight text-[var(--color-ink)] leading-snug">
              {product.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 text-[var(--color-warning)]">
                <span aria-hidden>★★★★★</span>
              </span>
              <span className="font-semibold text-[var(--color-ink)]">{rating.score.toFixed(1)}</span>
              <span className="text-[var(--color-ink-muted)]">({rating.reviews} reviews)</span>
              <span aria-hidden className="text-[var(--color-border)]">|</span>
              <span className={isOutOfStock ? 'text-[var(--color-error)] font-semibold' : 'text-[var(--color-success)] font-semibold'}>
                {isOutOfStock ? 'Out of stock' : `${product.stock} in stock`}
              </span>
            </div>

            {/* ─── Price card ──────────────────────────────── */}
            <div className="rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-promo-subtle)] to-[var(--color-brand-subtle)] p-5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl md:text-4xl font-extrabold text-[var(--color-promo)]">
                  {formatPrice(product.price)}
                </span>
                {promo && (
                  <>
                    <span className="text-base text-[var(--color-ink-muted)] line-through">
                      {formatPrice(promo.originalPrice)}
                    </span>
                    <span className="inline-flex items-center h-6 px-2 rounded-md bg-[var(--color-promo)] text-white text-xs font-bold">
                      -{promo.discountPct}%
                    </span>
                  </>
                )}
              </div>
              {promo && (
                <p className="mt-1.5 text-sm text-[var(--color-success)] font-semibold">
                  You save {formatPrice(promo.originalPrice - product.price)}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md bg-white text-[var(--color-brand)] text-xs font-semibold border border-[var(--color-brand)]/30">
                  Trả góp 0%
                </span>
                <span className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md bg-white text-[var(--color-ink-secondary)] text-xs font-semibold border border-[var(--color-border)]">
                  Giao hàng nhanh
                </span>
                <span className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md bg-white text-[var(--color-ink-secondary)] text-xs font-semibold border border-[var(--color-border)]">
                  Bảo hành 24 tháng
                </span>
              </div>
            </div>

            {/* ─── Quantity + CTA ─────────────────────────── */}
            {isAuthenticated ? (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-muted)]">
                  Quantity
                </label>
                <div className="flex items-stretch gap-3">
                  <div className="flex items-stretch h-12 rounded-[var(--radius-md)] border border-[var(--color-border)] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(-1)}
                      disabled={stepperDisabled || quantity <= 1}
                      className="w-11 grid place-items-center text-[var(--color-ink)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (Number.isNaN(v)) return;
                        setQuantity(Math.max(1, Math.min(product.stock, v)));
                      }}
                      disabled={stepperDisabled}
                      className="w-14 text-center bg-transparent text-base font-bold text-[var(--color-ink)] focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      aria-label="Quantity"
                    />
                    <button
                      type="button"
                      onClick={() => handleQtyChange(1)}
                      disabled={stepperDisabled || quantity >= product.stock}
                      className="w-11 grid place-items-center text-[var(--color-ink)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={stepperDisabled}
                    className="flex-1 h-12 px-5 rounded-[var(--radius-md)] bg-[var(--color-surface)] border-2 border-[var(--color-brand)] text-[var(--color-brand)] text-sm font-bold hover:bg-[var(--color-brand-subtle)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {addSuccess ? 'Added ✓' : addMutation.isPending ? 'Adding…' : 'Add to cart'}
                  </button>
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={stepperDisabled}
                    className="flex-1 h-12 px-5 rounded-[var(--radius-md)] bg-[var(--color-promo)] text-white text-sm font-bold hover:bg-[var(--color-promo-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[var(--shadow-sm)]"
                  >
                    Buy now
                  </button>
                </div>
                {addError && <InlineError message={addError} />}
              </div>
            ) : (
              <div className="rounded-[var(--radius-md)] bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] p-4">
                <p className="text-sm text-[var(--color-warning-text)]">
                  <Link
                    to="/login"
                    state={{ from: { pathname: `/products/${productId}` } }}
                    className="font-bold underline underline-offset-2 hover:opacity-80"
                  >
                    Sign in
                  </Link>{' '}
                  to add this item to your cart.
                </p>
              </div>
            )}

            {/* ─── Trust strip ────────────────────────────── */}
            <ul className="grid grid-cols-2 gap-3 mt-2">
              {TRUST_ITEMS.map(({ Icon, title, sub }) => (
                <li
                  key={title}
                  className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)]"
                >
                  <div className="grid place-items-center w-9 h-9 rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand)] flex-shrink-0">
                    <Icon width={18} height={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{title}</p>
                    <p className="text-xs text-[var(--color-ink-muted)] truncate">{sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ─── Description ───────────────────────────────────── */}
        <section className="mt-12 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-6 md:p-8">
          <h2 className="text-lg md:text-xl font-bold text-[var(--color-ink)] tracking-tight">
            Product description
          </h2>
          <hr className="mt-3 mb-5 border-t border-[var(--color-border-subtle)]" />
          <p className="text-sm md:text-base text-[var(--color-ink-secondary)] leading-relaxed whitespace-pre-line max-w-prose">
            {product.description || 'No description available for this product.'}
          </p>
        </section>

        {/* ─── Reviews ──────────────────────────────────────── */}
        <ProductComments product={product} />

        {/* ─── Related products ─────────────────────────────── */}
        <RelatedProducts currentProductId={productId} />

        {/* ─── Recently viewed ──────────────────────────────── */}
        <RecentlyViewed excludeId={productId} />
      </div>
    </div>
  );
}

interface ProductGalleryProps {
  product: Product;
  activeThumb: number;
  onSelect: (i: number) => void;
}

function ProductGallery({ product, activeThumb, onSelect }: ProductGalleryProps) {
  const gradient = getProductPlaceholderGradient(product);
  const letter = product.name.charAt(0).toUpperCase();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Each "view" is the same gradient with a slightly rotated hue, just for thumbnail variety.
  const thumbs = [0, 1, 2, 3];

  // Close lightbox on Escape; lock body scroll while open.
  useEffect(() => {
    if (!isLightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsLightboxOpen(false);
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isLightboxOpen]);

  return (
    <div className="lg:col-span-4">
      <div className="flex gap-3 max-w-md lg:max-w-none">
        {/* Thumbnails — vertical strip on the left */}
        <ul className="flex flex-col gap-2 w-16 md:w-20 flex-shrink-0">
          {thumbs.map((i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                className={`block w-full aspect-square rounded-[var(--radius-md)] overflow-hidden border-2 transition-colors ${
                  activeThumb === i
                    ? 'border-[var(--color-brand)]'
                    : 'border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]'
                }`}
                aria-label={`View ${i + 1}`}
                aria-pressed={activeThumb === i}
              >
                <span
                  aria-hidden
                  className="block w-full h-full"
                  style={{
                    background: gradient,
                    filter: `hue-rotate(${i * 12}deg) brightness(${i === activeThumb ? 1 : 0.92})`,
                  }}
                />
              </button>
            </li>
          ))}
        </ul>

        {/* Main image — smaller, hover-zoom on active, click for full-size lightbox */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          aria-label="Open image at full size"
          className="group relative aspect-square flex-1 rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2"
        >
          <span
            aria-hidden
            className="absolute inset-0 transition-transform duration-[var(--duration-slow)] ease-out group-hover:scale-110 group-focus-visible:scale-110"
            style={{
              background: gradient,
              transform: `rotate(${activeThumb * 4}deg) scale(1.05)`,
              filter: `hue-rotate(${activeThumb * 12}deg)`,
            }}
          />
          <span
            aria-hidden
            className="absolute inset-0 grid place-items-center text-white/95 text-[7rem] md:text-[8rem] font-extrabold tracking-tight drop-shadow-lg select-none"
          >
            {letter}
          </span>
          <span
            aria-hidden
            className="absolute bottom-2 right-2 inline-flex items-center gap-1 h-6 px-2 rounded-md bg-black/55 text-white text-[11px] font-semibold backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ⤢ View full
          </span>
        </button>
      </div>

      {isLightboxOpen && (
        <Lightbox
          gradient={gradient}
          letter={letter}
          activeThumb={activeThumb}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  );
}

interface LightboxProps {
  gradient: string;
  letter: string;
  activeThumb: number;
  onClose: () => void;
}

function Lightbox({ gradient, letter, activeThumb, onClose }: LightboxProps) {
  // Portal to document.body so the fixed overlay isn't contained by any
  // transformed ancestor (e.g. the .page-enter wrapper).
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Product image — full size"
      onClick={onClose}
      className="fixed inset-0 z-[100] grid place-items-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close full-size image"
        className="absolute top-4 right-4 grid place-items-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white z-10"
      >
        ×
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[min(90vw,80vh)] aspect-square rounded-[var(--radius-lg)] overflow-hidden shadow-2xl"
      >
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background: gradient,
            transform: `rotate(${activeThumb * 4}deg) scale(1.05)`,
            filter: `hue-rotate(${activeThumb * 12}deg)`,
          }}
        />
        <span
          aria-hidden
          className="absolute inset-0 grid place-items-center text-white/95 font-extrabold tracking-tight drop-shadow-2xl select-none"
          style={{ fontSize: 'min(40vw, 36vh)', lineHeight: 1 }}
        >
          {letter}
        </span>
      </div>
    </div>,
    document.body,
  );
}
