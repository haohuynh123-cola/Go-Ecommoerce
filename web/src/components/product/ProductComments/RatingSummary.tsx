/**
 * RatingSummary — Tiki / CellphoneS style review summary card.
 *
 * Layout:
 *   ┌──────────────┬────────────────────────────────────────┐
 *   │   5.0 / 5    │ 5★ █████████████████████  31 đánh giá │
 *   │   ★★★★★      │ 4★ █                       1 đánh giá │
 *   │ 32 lượt đg.  │ 3★                         0 đánh giá │
 *   │ [Viết ĐG]    │ 2★                         0 đánh giá │
 *   │              │ 1★                         0 đánh giá │
 *   └──────────────┴────────────────────────────────────────┘
 *
 * The distribution is computed from the comments currently loaded on the page
 * (replies excluded — only top-level rated comments count). When pagination is
 * server-side this may underrepresent total counts, but the average + total
 * always come from the canonical pagination meta.
 */

import type { ProductComment } from '@/lib/api/types';

interface RatingSummaryProps {
  /** Top-level comments (replies are filtered automatically). */
  comments: ProductComment[];
  /** Authoritative total review count from pagination meta. */
  totalCount: number;
  /** Pre-computed average from comments (1-decimal). null when no ratings yet. */
  averageRating: number | null;
  /** Click handler for the "Viết đánh giá" button. */
  onWriteReview: () => void;
}

const STAR_BUCKETS = [5, 4, 3, 2, 1] as const;

export function RatingSummary({
  comments,
  totalCount,
  averageRating,
  onWriteReview,
}: RatingSummaryProps) {
  const distribution = computeDistribution(comments);
  const distributionTotal = STAR_BUCKETS.reduce((sum, n) => sum + distribution[n], 0);
  const displayAvg = averageRating ?? 0;

  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-5 md:p-6">
      <div className="grid grid-cols-[minmax(0,180px)_1fr] gap-6 md:gap-10 items-center">
        {/* ── Left: score + button ─────────────────────────────── */}
        <div className="flex flex-col items-start gap-2 text-left">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--color-ink)] tabular-nums">
              {displayAvg.toFixed(1)}
            </span>
            <span className="text-2xl md:text-3xl font-bold text-[var(--color-ink-muted)]">
              /5
            </span>
          </div>

          <BigStars value={displayAvg} />

          <p className="text-[length:var(--text-sm)] text-[var(--color-ink-secondary)]">
            {totalCount} lượt đánh giá
          </p>

          <button
            type="button"
            onClick={onWriteReview}
            className="mt-2 h-10 px-6 rounded-[var(--radius-md)] bg-[var(--color-promo)] text-white text-[length:var(--text-sm)] font-semibold hover:bg-[var(--color-promo-hover)] active:translate-y-px transition-all shadow-[var(--shadow-sm)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-promo)] focus-visible:outline-offset-2"
          >
            Viết đánh giá
          </button>
        </div>

        {/* ── Right: distribution bars ─────────────────────────── */}
        <ul className="flex flex-col gap-2 min-w-0" aria-label="Phân bố đánh giá">
          {STAR_BUCKETS.map((star) => {
            const count = distribution[star];
            const pct = distributionTotal === 0 ? 0 : (count / distributionTotal) * 100;
            return (
              <li key={star} className="flex items-center gap-3">
                <span className="inline-flex items-center gap-0.5 w-7 text-[length:var(--text-sm)] font-semibold text-[var(--color-ink-secondary)] tabular-nums">
                  {star}
                  <span aria-hidden className="text-[var(--color-warning)]">★</span>
                </span>
                <div
                  className="flex-1 h-2 rounded-full bg-[var(--color-border-subtle)] overflow-hidden"
                  role="progressbar"
                  aria-valuenow={Math.round(pct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${star} sao: ${count} đánh giá`}
                >
                  <div
                    className="h-full bg-[var(--color-promo)] rounded-full transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-20 text-right text-[length:var(--text-xs)] text-[var(--color-ink-muted)] tabular-nums">
                  {count} đánh giá
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** Big yellow stars row for the score readout (5 stars). */
function BigStars({ value }: { value: number }) {
  const floored = Math.floor(value);
  const hasFraction = value - floored >= 0.5;
  return (
    <span
      aria-label={`${value.toFixed(1)} trên 5 sao`}
      className="inline-flex items-center gap-0.5"
    >
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < floored || (i === floored && hasFraction);
        return (
          <span
            key={i}
            aria-hidden
            className="text-[length:var(--text-base)] leading-none"
            style={{ color: filled ? 'var(--color-warning)' : 'var(--color-border-strong)' }}
          >
            ★
          </span>
        );
      })}
    </span>
  );
}

/** Bucket loaded top-level comments into a {1..5: count} histogram. */
function computeDistribution(comments: ProductComment[]): Record<number, number> {
  const buckets: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const c of comments) {
    if (c.parent_comment_id != null) continue;
    const r = Math.round(c.rating);
    if (r >= 1 && r <= 5) buckets[r] += 1;
  }
  return buckets;
}
