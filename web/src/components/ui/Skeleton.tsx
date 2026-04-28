import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SkeletonProps {
  /** Extra Tailwind classes for size/shape overrides, e.g. `"h-4 w-24"`. */
  className?: string;
  /** Screen-reader announcement. Defaults to "Loading". */
  ariaLabel?: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
//
// Renders a shimmer placeholder block.
//
//   <Skeleton className="h-4 w-32" />               — short text line
//   <Skeleton className="h-10 w-10 rounded-full" />  — avatar circle
//   <Skeleton className="h-32 w-full" />             — card-height block
//
// The shimmer is pure CSS (background-position slide on a linear-gradient).
// Only `background-position` is animated — compositor-friendly.
// The `skeleton-shimmer` animation class is defined in globals.css and
// disabled automatically under `prefers-reduced-motion: reduce`.
//
// ─────────────────────────────────────────────────────────────────────────────

export function Skeleton({ className, ariaLabel = 'Loading' }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
      // Outer wrapper carries the aria semantics; inner does the visual work
      // so we can keep aria-hidden on the shimmer div itself.
      className={clsx('rounded-[var(--radius-sm)] overflow-hidden', className)}
    >
      <div
        aria-hidden="true"
        className="skeleton-shimmer h-full w-full"
        style={{
          backgroundImage:
            'linear-gradient(90deg, var(--color-surface-muted) 25%, var(--color-border-subtle) 50%, var(--color-surface-muted) 75%)',
          backgroundSize: '400% 100%',
          animation: 'skeleton-shimmer 1.6s ease-in-out infinite',
          minHeight: '1em',
        }}
      />
    </div>
  );
}
