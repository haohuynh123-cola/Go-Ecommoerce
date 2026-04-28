import type { ReactNode } from 'react';
import { clsx } from 'clsx';

type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'muted';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-accent-subtle)] text-[var(--color-ink-secondary)] border-[var(--color-border)]',
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]',
  error:   'bg-[var(--color-error-bg)] text-[var(--color-error)] border-[var(--color-error)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)]',
  info:    'bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info)]',
  muted:   'bg-[var(--color-border-subtle)] text-[var(--color-ink-muted)] border-[var(--color-border-subtle)]',
};

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-block border rounded-[var(--radius-sm)] px-[0.5em] py-[0.15em]',
        'text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase',
        variantClasses[variant],
      )}
    >
      {children}
    </span>
  );
}
