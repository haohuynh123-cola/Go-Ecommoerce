import { useCallback, useEffect, useState } from 'react';

import {
  RECENTLY_VIEWED_EVENT,
  clearRecentlyViewed,
  readRecentlyViewed,
  trackRecentlyViewed,
} from '@/lib/utils/recentlyViewed';

interface UseRecentlyViewedReturn {
  /** Ordered IDs, newest first. */
  ids: number[];
  /** Append a product ID. Deduplicates and caps internally. */
  track: (productId: number) => void;
  /** Clear all entries. */
  clear: () => void;
}

/**
 * React-side accessor for the recently-viewed cache.
 *
 * Stays in sync with:
 *  - same-tab updates (via a custom event)
 *  - other-tab updates (via the `storage` event)
 */
export function useRecentlyViewed(): UseRecentlyViewedReturn {
  const [ids, setIds] = useState<number[]>(() => readRecentlyViewed());

  useEffect(() => {
    function refresh() {
      setIds(readRecentlyViewed());
    }
    window.addEventListener(RECENTLY_VIEWED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(RECENTLY_VIEWED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const track = useCallback((productId: number) => {
    setIds(trackRecentlyViewed(productId));
  }, []);

  const clear = useCallback(() => {
    clearRecentlyViewed();
    setIds([]);
  }, []);

  return { ids, track, clear };
}
