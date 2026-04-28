import type { ReactNode } from 'react';
import { clsx } from 'clsx';

export type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'brand' | 'neutral';

interface StatusPillProps {
  tone?: StatusTone;
  children: ReactNode;
  /** Whether to show the leading dot indicator (default true). */
  dot?: boolean;
  /** Solid filled variant (used on dark backgrounds). */
  solid?: boolean;
  className?: string;
}

const toneMap: Record<StatusTone, { bg: string; fg: string; dot: string; solidBg: string; solidFg: string }> = {
  success: {
    bg:       'bg-[var(--color-success-bg)] text-[var(--color-success)]',
    fg:       'text-[var(--color-success)]',
    dot:      'bg-[var(--color-success)]',
    solidBg:  'bg-[var(--color-success)] text-white',
    solidFg:  'text-white',
  },
  warning: {
    bg:       'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]',
    fg:       'text-[var(--color-warning-text)]',
    dot:      'bg-[var(--color-warning)]',
    solidBg:  'bg-[var(--color-warning)] text-white',
    solidFg:  'text-white',
  },
  error: {
    bg:       'bg-[var(--color-error-bg)] text-[var(--color-error)]',
    fg:       'text-[var(--color-error)]',
    dot:      'bg-[var(--color-error)]',
    solidBg:  'bg-[var(--color-error)] text-white',
    solidFg:  'text-white',
  },
  info: {
    bg:       'bg-[var(--color-info-bg)] text-[var(--color-info)]',
    fg:       'text-[var(--color-info)]',
    dot:      'bg-[var(--color-info)]',
    solidBg:  'bg-[var(--color-info)] text-white',
    solidFg:  'text-white',
  },
  brand: {
    bg:       'bg-[var(--color-brand-subtle)] text-[var(--color-brand)]',
    fg:       'text-[var(--color-brand)]',
    dot:      'bg-[var(--color-brand)]',
    solidBg:  'bg-[var(--color-brand)] text-white',
    solidFg:  'text-white',
  },
  neutral: {
    bg:       'bg-[var(--color-surface-muted)] text-[var(--color-ink-secondary)]',
    fg:       'text-[var(--color-ink-secondary)]',
    dot:      'bg-[var(--color-ink-muted)]',
    solidBg:  'bg-[var(--color-ink)] text-white',
    solidFg:  'text-white',
  },
};

/**
 * Small inline status pill with optional dot indicator.
 *
 * Usage:
 *   <StatusPill tone="success">Placed</StatusPill>
 *   <StatusPill tone="error" dot>Out of stock</StatusPill>
 *   <StatusPill tone="brand" solid>NEW</StatusPill>
 */
export function StatusPill({
  tone = 'neutral',
  children,
  dot = true,
  solid = false,
  className,
}: StatusPillProps) {
  const c = toneMap[tone];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11px] font-bold whitespace-nowrap',
        solid ? c.solidBg : c.bg,
        className,
      )}
    >
      {dot && <span aria-hidden className={`w-1.5 h-1.5 rounded-full ${solid ? 'bg-white/80' : c.dot}`} />}
      {children}
    </span>
  );
}
