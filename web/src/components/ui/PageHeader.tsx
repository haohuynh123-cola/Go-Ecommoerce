import type { ReactNode } from 'react';

interface PageHeaderProps {
  /** Optional small uppercase label above the title (e.g. "New product"). Tinted brand-blue. */
  kicker?: ReactNode;
  /** Required page title. Renders as <h1>. */
  title: ReactNode;
  /** Optional one-line description below the title. */
  subtitle?: ReactNode;
  /** Right-aligned action slot (typically buttons / links). */
  actions?: ReactNode;
  className?: string;
}

/**
 * Standard page header used at the top of every route view.
 * Layout: [kicker]   [actions →]
 *         <h1>
 *         <subtitle>
 *
 * Use this everywhere — it enforces consistent typography, spacing, and the
 * brand-blue kicker pattern that distinguishes "system" routes (admin) from
 * generic content.
 */
export function PageHeader({ kicker, title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header className={`flex flex-wrap items-end justify-between gap-3 ${className ?? ''}`}>
      <div className="min-w-0">
        {kicker && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand)]">
            {kicker}
          </p>
        )}
        <h1 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--color-ink)] leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </header>
  );
}
