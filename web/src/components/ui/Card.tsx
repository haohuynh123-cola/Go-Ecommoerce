import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

type Padding = 'none' | 'sm' | 'md' | 'lg';
type Variant = 'default' | 'muted' | 'sidebar';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: Padding;
  variant?: Variant;
  /** Render dashed border (used by empty-state placeholders). */
  dashed?: boolean;
}

const padMap: Record<Padding, string> = {
  none: '',
  sm:   'p-3 md:p-4',
  md:   'p-4 md:p-5',
  lg:   'p-5 md:p-6',
};

const variantMap: Record<Variant, string> = {
  default: 'bg-[var(--color-surface)] border border-[var(--color-border-subtle)]',
  muted:   'bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)]',
  sidebar: 'bg-[var(--color-sidebar)] text-white border border-white/10',
};

/**
 * Base card surface used everywhere a content block is grouped.
 * Always rounded-lg, never rounded-md — that's reserved for inputs/buttons.
 */
export function Card({
  padding = 'md',
  variant = 'default',
  dashed,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-[var(--radius-lg)]',
        variantMap[variant],
        dashed && 'border-dashed',
        padMap[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
