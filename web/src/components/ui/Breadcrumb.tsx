import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: ReactNode;
  /** Internal route. Omit for the current (last) page. */
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Slash-separated breadcrumb. Last item rendered as plain text (the current page).
 * Wraps onto multiple lines on narrow viewports.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null;
  return (
    <nav className={`text-xs text-[var(--color-ink-muted)] ${className ?? ''}`} aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5 min-w-0">
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="hover:text-[var(--color-brand)] transition-colors truncate max-w-[24ch]"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-[var(--color-ink)] font-medium truncate max-w-[40ch]">
                  {item.label}
                </span>
              )}
              {!isLast && <span aria-hidden>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
