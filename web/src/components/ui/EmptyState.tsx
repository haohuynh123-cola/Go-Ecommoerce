import type { ComponentType, ReactNode, SVGProps } from 'react';

interface EmptyStateProps {
  /** Icon component (use one from layout/icons.tsx). Rendered inside a 64px brand-subtle circle. */
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: ReactNode;
  description?: ReactNode;
  /** Primary CTA shown below the description. */
  actions?: ReactNode;
  /** Render with dashed border (default true). Set false for a solid empty card. */
  dashed?: boolean;
  /** Vertical padding. */
  size?: 'md' | 'lg';
  className?: string;
}

const sizeMap: Record<NonNullable<EmptyStateProps['size']>, string> = {
  md: 'py-12 px-6',
  lg: 'py-20 px-6',
};

/**
 * Standard empty state: an icon-in-circle, a title, supporting copy, optional CTA(s).
 * Use this for: empty list, zero-search-results, "no orders yet", etc.
 *
 * Why a single component? Keeping the icon size, ring, copy spacing, and CTA
 * placement consistent across pages stops empty states from drifting visually
 * over time.
 */
export function EmptyState({
  Icon,
  title,
  description,
  actions,
  dashed = true,
  size = 'lg',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center text-center rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] ${dashed ? 'border-dashed' : ''} ${sizeMap[size]} ${className ?? ''}`}
    >
      <div className="grid place-items-center w-16 h-16 rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand)] mb-4">
        <Icon width={28} height={28} />
      </div>
      <h2 className="text-lg font-bold text-[var(--color-ink)]">{title}</h2>
      {description && (
        <p className="mt-2 max-w-md text-sm text-[var(--color-ink-muted)]">{description}</p>
      )}
      {actions && <div className="mt-5 flex items-center gap-2 flex-wrap justify-center">{actions}</div>}
    </div>
  );
}
