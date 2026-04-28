import { useState } from 'react';
import type { MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';

import { addToCart } from '@/lib/api/cart';
import { formatPrice } from '@/lib/utils/format';
import { useAuth } from '@/hooks/useAuth';
import {
  getProductBadgeMock,
  getProductPlaceholderGradient,
  getProductPromoMock,
  getProductRatingMock,
} from '@/lib/utils/product';
import type { Product } from '@/lib/api/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<'idle' | 'added' | 'error'>('idle');

  const promo = getProductPromoMock(product);
  const rating = getProductRatingMock(product);
  const tag = getProductBadgeMock(product);
  const isOutOfStock = product.stock === 0;

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

  function handleAdd(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${product.id}` } } });
      return;
    }
    addMutation.mutate();
  }

  const buttonLabel =
    feedback === 'added'   ? 'Added to cart'
    : feedback === 'error' ? 'Failed — retry'
    : addMutation.isPending ? 'Adding…'
    : 'Add to cart';

  return (
    <li
      className="group relative flex flex-col bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] overflow-hidden transition-all duration-[var(--duration-normal)] hover:border-[var(--color-brand)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
    >
      {/* ─── Badges (top-left stack) ─────────────────────────── */}
      <div className="absolute top-3 left-3 z-[2] flex flex-col items-start gap-1.5">
        {promo && (
          <span className="inline-flex items-center h-6 px-2 rounded-md bg-[var(--color-promo)] text-white text-[11px] font-bold tracking-wide">
            -{promo.discountPct}%
          </span>
        )}
        {tag === 'bestseller' && (
          <span className="inline-flex items-center h-6 px-2 rounded-md bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)] text-[11px] font-bold tracking-wide">
            ★ Best seller
          </span>
        )}
        {tag === 'hot' && (
          <span className="inline-flex items-center h-6 px-2 rounded-md bg-[var(--color-promo-subtle)] text-[var(--color-promo)] border border-[var(--color-promo)]/30 text-[11px] font-bold tracking-wide">
            🔥 Hot
          </span>
        )}
        {tag === 'new' && (
          <span className="inline-flex items-center h-6 px-2 rounded-md bg-[var(--color-brand-subtle)] text-[var(--color-brand)] border border-[var(--color-brand)] text-[11px] font-bold tracking-wide">
            NEW
          </span>
        )}
      </div>

      {/* ─── Out-of-stock veil ───────────────────────────────── */}
      {isOutOfStock && (
        <div className="absolute inset-0 z-[3] grid place-items-center bg-white/70 backdrop-blur-sm pointer-events-none">
          <span className="px-3 py-1.5 rounded-md bg-[var(--color-ink)] text-white text-xs font-bold uppercase tracking-widest">
            Out of stock
          </span>
        </div>
      )}

      {/* ─── Image / placeholder ─────────────────────────────── */}
      <Link
        to={`/products/${product.id}`}
        className="block relative aspect-square overflow-hidden bg-[var(--color-surface-muted)]"
        aria-label={product.name}
      >
        <div
          aria-hidden
          className="absolute inset-0 transition-transform duration-[var(--duration-slow)] group-hover:scale-105"
          style={{ background: getProductPlaceholderGradient(product) }}
        />
        <span
          aria-hidden
          className="absolute inset-0 grid place-items-center text-white/95 text-[5rem] font-extrabold tracking-tight drop-shadow-md select-none"
        >
          {product.name.charAt(0).toUpperCase()}
        </span>
      </Link>

      {/* ─── Body ───────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        <Link
          to={`/products/${product.id}`}
          className="block text-sm font-semibold text-[var(--color-ink)] leading-snug line-clamp-2 min-h-[2.6em] hover:text-[var(--color-brand)] transition-colors"
        >
          {product.name}
        </Link>

        {/* Rating + SKU */}
        <div className="flex items-center gap-2 text-xs text-[var(--color-ink-muted)]">
          <span className="inline-flex items-center gap-0.5 text-[var(--color-warning)]">
            <span aria-hidden>★</span>
            <span className="font-semibold text-[var(--color-ink-secondary)]">{rating.score.toFixed(1)}</span>
          </span>
          <span aria-hidden>·</span>
          <span>{rating.reviews} reviews</span>
          <span aria-hidden className="ml-auto">{product.sku}</span>
        </div>

        {/* Price block */}
        <div className="mt-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-extrabold text-[var(--color-promo)]">
              {formatPrice(product.price)}
            </span>
            {promo && (
              <span className="text-xs text-[var(--color-ink-muted)] line-through">
                {formatPrice(promo.originalPrice)}
              </span>
            )}
          </div>
          {promo && (
            <p className="text-[11px] text-[var(--color-success)] font-semibold mt-0.5">
              Save {formatPrice(promo.originalPrice - product.price)}
            </p>
          )}
        </div>

        {/* Trả góp pill */}
        <div className="mt-1">
          <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-[var(--color-brand-subtle)] text-[var(--color-brand)] text-[11px] font-semibold">
            Trả góp 0%
          </span>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={isOutOfStock || addMutation.isPending}
          aria-live="polite"
          className={clsx(
            'mt-auto h-10 rounded-[var(--radius-md)] text-sm font-semibold transition-colors',
            'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            feedback === 'added' && 'bg-[var(--color-success)] hover:bg-[var(--color-success)]',
            feedback === 'error' && 'bg-[var(--color-error)] hover:bg-[var(--color-error)]',
          )}
        >
          {buttonLabel}
        </button>
      </div>
    </li>
  );
}
