import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { Skeleton } from '@/components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Computed delta percentage — null/undefined means no data (renders 0.00% muted). */
export interface KpiDelta {
  /** Signed float, e.g. 12.5 for +12.5% or -8.3 for -8.3%. */
  pct: number;
}

export interface KpiCardProps {
  label: string;
  /** Pre-formatted display string — caller is responsible for formatting. */
  value: string;
  /** Monochrome metric icon, top-right. */
  icon?: ReactNode;
  /**
   * Explicit top-right override (e.g. a "$" glyph for revenue).
   * When both `topRight` and `icon` are given, `topRight` wins.
   */
  topRight?: ReactNode;
  /** Omit or pass null to suppress the delta line entirely. */
  delta?: KpiDelta | null;
  subtitle?: string;
  /**
   * Semantic colour for the value text.
   * Use `success` / `error` only when the value *itself* signals a state
   * (e.g. out-of-stock count → error, available count → success).
   * Default: `ink`.
   */
  valueColor?: 'ink' | 'success' | 'error';
  /**
   * When true, replaces value / delta / subtitle with skeleton placeholders.
   * Card chrome (border, padding, accent rail) and the label line remain
   * visible so the layout doesn't jump when data arrives.
   */
  loading?: boolean;
}

// ─── DeltaLine ────────────────────────────────────────────────────────────────

interface DeltaLineProps {
  delta: KpiDelta | null;
}

function DeltaLine({ delta }: DeltaLineProps) {
  const pct = delta?.pct ?? 0;
  const isZero = pct === 0;
  const isPositive = pct > 0;

  const colorCls = isZero
    ? 'text-[var(--color-ink-muted)]'
    : isPositive
      ? 'text-[var(--color-success)]'
      : 'text-[var(--color-error)]';

  const label = isZero
    ? '0.00%'
    : `${isPositive ? '+' : ''}${pct.toFixed(2)}%`;

  return (
    <p
      className={clsx(
        'flex items-center gap-0.5 text-xs font-medium tabular-nums leading-none',
        colorCls,
      )}
      aria-label={`Change: ${label}`}
    >
      {!isZero && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="flex-shrink-0"
        >
          {isPositive ? (
            <path d="m6 14 6-6 6 6" />
          ) : (
            <path d="m6 10 6 6 6-6" />
          )}
        </svg>
      )}
      {label}
    </p>
  );
}

// ─── KpiCard ──────────────────────────────────────────────────────────────────

export function KpiCard({
  label,
  value,
  icon,
  topRight,
  delta,
  subtitle,
  valueColor = 'ink',
  loading = false,
}: KpiCardProps) {
  const valueCls =
    valueColor === 'success'
      ? 'text-[var(--color-success)]'
      : valueColor === 'error'
        ? 'text-[var(--color-error)]'
        : 'text-[var(--color-ink)]';

  const topRightContent = topRight ?? icon;

  return (
    <li
      aria-label={loading ? `Loading ${label}` : undefined}
      className={clsx(
        // Surface
        'flex flex-col gap-2 p-4',
        'bg-[var(--color-surface)] rounded-[var(--radius-lg)]',
        'border border-[var(--color-border-subtle)]',
        'shadow-[var(--shadow-xs)]',
        // Hover: border darkens, faint shadow nudge — no lift
        'transition-[border-color,box-shadow]',
        'duration-[var(--duration-fast)] ease-[var(--ease-out)]',
        'hover:border-[var(--color-border)] hover:shadow-[var(--shadow-sm)]',
        // Keyboard focus ring
        'focus-within:ring-2 focus-within:ring-[var(--color-brand)]/30',
      )}
    >
      {/* Row 1: label + info dot + optional top-right glyph/icon */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 min-w-0">
          <p className="text-xs font-medium text-[var(--color-ink-muted)] truncate leading-none">
            {label}
          </p>
          {/* Inline circle-i info dot */}
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="flex-shrink-0 text-[var(--color-ink-disabled)] opacity-70"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v.01M12 11v5" />
          </svg>
        </div>

        {/* Icon slot: skeleton circle when loading, real icon otherwise */}
        {loading ? (
          <Skeleton className="w-4 h-4 rounded-full flex-shrink-0" ariaLabel="Loading icon" />
        ) : (
          topRightContent && (
            <span
              aria-hidden="true"
              className="flex-shrink-0 text-[var(--color-ink-disabled)] leading-none [&>svg]:w-4 [&>svg]:h-4 opacity-60"
            >
              {topRightContent}
            </span>
          )
        )}
      </div>

      {loading ? (
        <>
          {/* Row 2 skeleton: big value placeholder */}
          <Skeleton className="h-6 w-20" ariaLabel="Loading value" />
          {/* Row 3 skeleton: delta placeholder */}
          <Skeleton className="h-3 w-10" ariaLabel="Loading change" />
          {/* Row 4 skeleton: subtitle placeholder */}
          <Skeleton className="h-3 w-14" ariaLabel="Loading detail" />
        </>
      ) : (
        <>
          {/* Row 2: big value */}
          <p
            className={clsx(
              'text-xl font-bold tracking-tight tabular-nums leading-none',
              valueCls,
            )}
          >
            {value}
          </p>

          {/* Row 3: delta — only rendered when explicitly provided */}
          {delta !== undefined && <DeltaLine delta={delta} />}

          {/* Row 4: subtitle */}
          {subtitle && (
            <p className="text-xs text-[var(--color-ink-muted)] leading-none">
              {subtitle}
            </p>
          )}
        </>
      )}
    </li>
  );
}
