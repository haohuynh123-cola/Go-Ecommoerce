/**
 * Storefront catalog taxonomy — Category + Brand definitions and the keyword
 * classifier used to map a Product into facets.
 *
 * NOTE: The backend `products` table has no `category`/`brand` columns yet, so
 * facet membership is derived client-side from a case-insensitive keyword scan
 * over `name + description`. When the backend ships those columns:
 *   1) Replace `matchesCategory` / `matchesBrand` with direct equality checks.
 *   2) Drop `keywords` from CATEGORIES and BRANDS.
 *   3) Replace the wide `page_size: 100` fetch with proper server-side
 *      filtering + pagination on the catalog page.
 */

import type { ComponentType, SVGProps } from 'react';

import {
  IconAccessory,
  IconCamera,
  IconHeadphones,
  IconLaptop,
  IconMonitor,
  IconPhone,
  IconTablet,
  IconWatch,
} from '@/components/layout/icons';
import type { Product } from '@/lib/api/types';

export interface Category {
  slug: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Lowercase keywords matched against name+description (substring). */
  keywords: string[];
}

export interface Brand {
  slug: string;
  label: string;
  /** Lowercase keywords matched against name+description (substring). */
  keywords: string[];
}

export const CATEGORIES: Category[] = [
  { slug: 'phones',      label: 'Phones',      Icon: IconPhone,      keywords: ['phone', 'iphone', 'galaxy', 'pixel', 'smartphone'] },
  { slug: 'laptops',     label: 'Laptops',     Icon: IconLaptop,     keywords: ['laptop', 'macbook', 'notebook', 'ultrabook', 'thinkpad'] },
  { slug: 'tablets',     label: 'Tablets',     Icon: IconTablet,     keywords: ['tablet', 'ipad', 'tab '] },
  { slug: 'watches',     label: 'Watches',     Icon: IconWatch,      keywords: ['watch', 'smartwatch', 'wearable'] },
  { slug: 'audio',       label: 'Audio',       Icon: IconHeadphones, keywords: ['audio', 'headphone', 'earbud', 'earphone', 'speaker', 'airpods', 'soundbar'] },
  { slug: 'cameras',     label: 'Cameras',     Icon: IconCamera,     keywords: ['camera', 'lens', 'gopro', 'mirrorless', 'dslr'] },
  { slug: 'monitors',    label: 'Monitors',    Icon: IconMonitor,    keywords: ['monitor', 'display', 'screen'] },
  { slug: 'accessories', label: 'Accessories', Icon: IconAccessory,  keywords: ['accessor', 'case', 'cable', 'charger', 'adapter', 'mouse', 'keyboard', 'stand', 'dock'] },
];

export const BRANDS: Brand[] = [
  { slug: 'apple',    label: 'Apple',    keywords: ['apple', 'iphone', 'ipad', 'macbook', 'airpods'] },
  { slug: 'samsung',  label: 'Samsung',  keywords: ['samsung', 'galaxy'] },
  { slug: 'sony',     label: 'Sony',     keywords: ['sony', 'wh-', 'wf-'] },
  { slug: 'dell',     label: 'Dell',     keywords: ['dell', 'xps', 'alienware'] },
  { slug: 'hp',       label: 'HP',       keywords: ['hp ', 'pavilion', 'omen', 'spectre'] },
  { slug: 'lenovo',   label: 'Lenovo',   keywords: ['lenovo', 'thinkpad', 'yoga', 'legion'] },
  { slug: 'asus',     label: 'Asus',     keywords: ['asus', 'rog', 'zenbook', 'tuf'] },
  { slug: 'logitech', label: 'Logitech', keywords: ['logitech', 'mx '] },
  { slug: 'jbl',      label: 'JBL',      keywords: ['jbl'] },
  { slug: 'bose',     label: 'Bose',     keywords: ['bose', 'quietcomfort'] },
];

const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));
const BRAND_BY_SLUG = new Map(BRANDS.map((b) => [b.slug, b]));

/** Case-insensitive substring check against name + description. */
function searchHaystack(product: Product): string {
  return `${product.name} ${product.description}`.toLowerCase();
}

export function matchesCategory(product: Product, slug: string): boolean {
  const category = CATEGORY_BY_SLUG.get(slug);
  if (!category) return false;
  const hay = searchHaystack(product);
  return category.keywords.some((kw) => hay.includes(kw));
}

export function matchesBrand(product: Product, slug: string): boolean {
  const brand = BRAND_BY_SLUG.get(slug);
  if (!brand) return false;
  const hay = searchHaystack(product);
  return brand.keywords.some((kw) => hay.includes(kw));
}

/**
 * Apply Category + Brand facets to a list of products.
 * Both are AND'd together. Empty / unknown slugs are no-ops.
 */
export function applyFacets(
  products: Product[],
  categorySlug: string | null,
  brandSlug: string | null,
): Product[] {
  return products.filter((p) => {
    if (categorySlug && !matchesCategory(p, categorySlug)) return false;
    if (brandSlug && !matchesBrand(p, brandSlug)) return false;
    return true;
  });
}

export interface FacetCounts {
  /** category slug → count after applying brand filter (so a user sees what would remain). */
  categoryCounts: Record<string, number>;
  /** brand slug → count after applying category filter. */
  brandCounts: Record<string, number>;
}

/**
 * Compute counts for each facet against a source list. Counts respect
 * cross-facet narrowing: brand counts apply the current category, and vice
 * versa. The currently-selected facet itself is NOT applied to its own counts
 * (so users always see the menu of options they can switch to).
 */
export function countFacets(
  products: Product[],
  categorySlug: string | null,
  brandSlug: string | null,
): FacetCounts {
  const byBrandOnly = brandSlug ? products.filter((p) => matchesBrand(p, brandSlug)) : products;
  const byCategoryOnly = categorySlug ? products.filter((p) => matchesCategory(p, categorySlug)) : products;

  const categoryCounts: Record<string, number> = {};
  for (const c of CATEGORIES) {
    categoryCounts[c.slug] = byBrandOnly.filter((p) => matchesCategory(p, c.slug)).length;
  }

  const brandCounts: Record<string, number> = {};
  for (const b of BRANDS) {
    brandCounts[b.slug] = byCategoryOnly.filter((p) => matchesBrand(p, b.slug)).length;
  }

  return { categoryCounts, brandCounts };
}
