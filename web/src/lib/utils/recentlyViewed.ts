/**
 * Recently-viewed products — localStorage-backed cache.
 *
 * Stores an ordered list of product IDs (newest first), deduplicated, capped at
 * MAX_ITEMS. All functions are SSR-safe (no-op when `window` is unavailable).
 */

const STORAGE_KEY = 'ecommce.recently_viewed';
const MAX_ITEMS = 12;

/** Read the cached list. Returns [] on missing/corrupted storage. */
export function readRecentlyViewed(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0)
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

/**
 * Append a product ID to the front of the list.
 * Deduplicates (move-to-front), caps at MAX_ITEMS, returns the new list.
 */
export function trackRecentlyViewed(productId: number): number[] {
  if (typeof window === 'undefined') return [];
  if (!Number.isFinite(productId) || productId <= 0) return readRecentlyViewed();

  const current = readRecentlyViewed();
  const next = [productId, ...current.filter((id) => id !== productId)].slice(0, MAX_ITEMS);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(RECENTLY_VIEWED_EVENT));
  } catch {
    /* quota exceeded or storage disabled — fail silently */
  }

  return next;
}

/** Clear the entire list. */
export function clearRecentlyViewed(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(RECENTLY_VIEWED_EVENT));
  } catch {
    /* fail silently */
  }
}

/** In-tab event name; fires after track/clear so other components can re-read. */
export const RECENTLY_VIEWED_EVENT = 'ecommce:recently-viewed-changed';

export const RECENTLY_VIEWED_LIMIT = MAX_ITEMS;
