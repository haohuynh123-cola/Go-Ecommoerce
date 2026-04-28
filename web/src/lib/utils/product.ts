import type { Product } from '@/lib/api/types';

/**
 * Deterministic, UI-only mocks so the redesigned catalog cards/detail page
 * have something to render. The backend `Product` does not yet expose an
 * image URL, original price, or rating — when those fields land, replace
 * each helper below with the real field access.
 */

export interface ProductPromoMock {
  /** Discount percent (1–99). */
  discountPct: number;
  /** Pre-discount price (in same currency as `Product.price`, here VND). */
  originalPrice: number;
}

/** Roughly one in three products gets a fake "sale" treatment for visual demo. */
export function getProductPromoMock(product: Product): ProductPromoMock | null {
  // TODO: replace with `product.original_price` once the backend exposes it.
  if (product.id % 3 !== 0) return null;
  const discountPct = 10 + ((product.id * 7) % 25); // 10–34
  const originalPrice = Math.round(product.price * (100 / (100 - discountPct)));
  return { discountPct, originalPrice };
}

export interface ProductRatingMock {
  /** 4.0 – 4.9 */
  score: number;
  /** Fake review count, deterministic by product id. */
  reviews: number;
}

export function getProductRatingMock(product: Product): ProductRatingMock {
  // TODO: replace with `product.rating` / `product.review_count` from backend.
  const score = 4.0 + ((product.id * 13) % 10) / 10;
  const reviews = 50 + ((product.id * 47) % 950);
  return { score: Math.round(score * 10) / 10, reviews };
}

/**
 * Deterministic gradient placeholder for products that have no image yet.
 * Accepts any object with a numeric `id` so we can use it for OrderItem,
 * CartItem.product, or full Product without coupling.
 */
export function getProductPlaceholderGradient(p: { id: number }): string {
  // TODO: replace with `<img src={product.image_url}/>` when backend exposes it.
  const hue = (p.id * 47) % 360;
  const altHue = (hue + 35) % 360;
  return `linear-gradient(135deg, oklch(60% 0.18 ${hue}), oklch(40% 0.16 ${altHue}))`;
}

/** Deterministic "tag" sprinkled on a subset of products (e.g. "Best seller"). */
export function getProductBadgeMock(product: Product): 'hot' | 'new' | 'bestseller' | null {
  // TODO: drive from real backend flags.
  const m = product.id % 7;
  if (m === 1) return 'bestseller';
  if (m === 4) return 'hot';
  if (m === 5) return 'new';
  return null;
}
