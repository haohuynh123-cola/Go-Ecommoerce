import type { ReactNode } from 'react';
import { clsx } from 'clsx';

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /**
   * - `solid`: active option is brand-filled (use when control is the primary filter on the page)
   * - `subtle`: active option is light + brand text (use inside toolbars)
   */
  variant?: 'solid' | 'subtle';
  ariaLabel?: string;
  className?: string;
}

/**
 * Pill-group filter control. Use this everywhere a small enum filter is
 * needed (date ranges, stock states, etc.). For larger taxonomies prefer
 * a select dropdown — segmented control breaks down past ~5 options.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = 'subtle',
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  if (variant === 'solid') {
    return (
      <div role="radiogroup" aria-label={ariaLabel} className={clsx('flex flex-wrap items-center gap-2', className)}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              className={clsx(
                'h-9 px-4 rounded-full text-sm font-medium transition-colors',
                active
                  ? 'bg-[var(--color-brand)] text-white'
                  : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  // subtle (default)
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={clsx('flex items-center gap-1 p-1 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]', className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={clsx(
              'h-8 px-3 rounded-md text-xs font-semibold transition-colors',
              active
                ? 'bg-[var(--color-surface-raised)] text-[var(--color-brand)] shadow-[var(--shadow-xs)]'
                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
