import type { ReactNode } from 'react';
import { clsx } from 'clsx';

import { IconArrowDown, IconArrowUp } from '@/components/layout/icons';

export type StatVariant = 'default' | 'accent' | 'mini';

export interface StatDelta {
  direction: 'up' | 'down' | 'flat';
  text: ReactNode;
}

interface StatCardProps {
  /** All-caps label above value. */
  label: ReactNode;
  /** Big value (formatted string). */
  value: ReactNode;
  /** Optional icon shown in the top-left square (only on `default` & `accent`). */
  icon?: ReactNode;
  /** Optional change indicator pill. */
  delta?: StatDelta;
  /**
   * default — neutral surface card
   * accent  — filled brand-blue (use for the headline KPI)
   * mini    — single-row, value right-aligned (used in toolbars)
   */
  variant?: StatVariant;
  /** Override colour of the value text (only respected on default/mini). */
  valueColor?: 'ink' | 'success' | 'error' | 'promo';
  className?: string;
}

/**
 * KPI / mini-stat card.
 *
 * Use `default` for dashboard tiles, `accent` for the standout KPI on a row,
 * and `mini` for compact toolbar stats above a table.
 */
export function StatCard({
  label,
  value,
  icon,
  delta,
  variant = 'default',
  valueColor = 'ink',
  className,
}: StatCardProps) {
  if (variant === 'mini') {
    const valColor =
      valueColor === 'error'   ? 'text-[var(--color-error)]'
      : valueColor === 'success' ? 'text-[var(--color-success)]'
      : valueColor === 'promo'   ? 'text-[var(--color-promo)]'
      : 'text-[var(--color-ink)]';
    return (
      <div className={clsx('rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-4 flex items-center justify-between', className)}>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-muted)]">
          {label}
        </p>
        <p className={`text-2xl font-extrabold tracking-tight tabular-nums ${valColor}`}>{value}</p>
      </div>
    );
  }

  const accent = variant === 'accent';
  return (
    <div
      className={clsx(
        'rounded-[var(--radius-lg)] p-5',
        accent
          ? 'bg-[var(--color-brand)] text-white shadow-[var(--shadow-sm)]'
          : 'bg-[var(--color-surface)] border border-[var(--color-border-subtle)]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        {icon && (
          <span
            className={clsx(
              'grid place-items-center w-9 h-9 rounded-md flex-shrink-0',
              accent
                ? 'bg-white/15 text-white'
                : 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)]',
            )}
          >
            {icon}
          </span>
        )}
        {delta && <DeltaPill delta={delta} accent={accent} />}
      </div>
      <p
        className={clsx(
          'mt-4 text-xs font-semibold uppercase tracking-widest',
          accent ? 'text-white/80' : 'text-[var(--color-ink-muted)]',
        )}
      >
        {label}
      </p>
      <p
        className={clsx(
          'mt-1 text-3xl font-extrabold tracking-tight tabular-nums',
          accent ? 'text-white' : 'text-[var(--color-ink)]',
        )}
      >
        {value}
      </p>
    </div>
  );
}

function DeltaPill({ delta, accent }: { delta: StatDelta; accent: boolean }) {
  const baseColor = accent
    ? 'bg-white/15 text-white'
    : delta.direction === 'up'
    ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
    : delta.direction === 'down'
    ? 'bg-[var(--color-error-bg)] text-[var(--color-error)]'
    : 'bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)]';
  return (
    <span className={clsx('inline-flex items-center gap-1 h-6 px-2 rounded-full text-[10px] font-bold', baseColor)}>
      {delta.direction === 'up' && <IconArrowUp width={11} height={11} />}
      {delta.direction === 'down' && <IconArrowDown width={11} height={11} />}
      {delta.text}
    </span>
  );
}
