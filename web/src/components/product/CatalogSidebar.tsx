import { useMemo, useState } from 'react';
import { clsx } from 'clsx';

import { BRANDS, CATEGORIES } from '@/lib/utils/catalog';
import type { FacetCounts } from '@/lib/utils/catalog';

interface CatalogSidebarProps {
  selectedCategory: string | null;
  selectedBrand: string | null;
  counts: FacetCounts;
  onSelectCategory: (slug: string | null) => void;
  onSelectBrand: (slug: string | null) => void;
  onClearAll: () => void;
}

export function CatalogSidebar({
  selectedCategory,
  selectedBrand,
  counts,
  onSelectCategory,
  onSelectBrand,
  onClearAll,
}: CatalogSidebarProps) {
  const hasActive = Boolean(selectedCategory || selectedBrand);

  return (
    <aside
      aria-label="Catalog filters"
      className="flex flex-col gap-5 lg:sticky lg:top-[5.5rem] lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto"
    >
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-ink)]">
          Filters
        </h2>
        {hasActive && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-brand)] transition-colors underline-offset-4 hover:underline"
          >
            Clear all
          </button>
        )}
      </header>

      <FacetGroup
        title="Category"
        searchPlaceholder="Search categories…"
        items={CATEGORIES.map((c) => ({
          slug: c.slug,
          label: c.label,
          Icon: c.Icon,
          count: counts.categoryCounts[c.slug] ?? 0,
        }))}
        selected={selectedCategory}
        onSelect={onSelectCategory}
      />

      <FacetGroup
        title="Brand"
        searchPlaceholder="Search brands…"
        items={BRANDS.map((b) => ({
          slug: b.slug,
          label: b.label,
          count: counts.brandCounts[b.slug] ?? 0,
        }))}
        selected={selectedBrand}
        onSelect={onSelectBrand}
      />
    </aside>
  );
}

interface FacetItem {
  slug: string;
  label: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  count: number;
}

interface FacetGroupProps {
  title: string;
  items: FacetItem[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
  searchPlaceholder?: string;
}

function FacetGroup({ title, items, selected, onSelect, searchPlaceholder }: FacetGroupProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <details
      open
      className="group rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)]"
    >
      <summary
        className="flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-ink-secondary)]">
          {title}
        </span>
        <svg
          aria-hidden
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[var(--color-ink-muted)] transition-transform group-open:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>

      <div className="px-2 pt-1 pb-1.5">
        <div className="relative">
          <svg
            aria-hidden
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] pointer-events-none"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder ?? `Search ${title.toLowerCase()}…`}
            aria-label={`Search ${title.toLowerCase()}`}
            className="w-full h-8 pl-7 pr-7 rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)] border border-transparent text-xs text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-brand)] focus:bg-[var(--color-surface-raised)] focus:shadow-[var(--shadow-focus)] transition"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 grid place-items-center w-5 h-5 rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)] transition-colors"
            >
              <svg
                aria-hidden
                width={10}
                height={10}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="px-3 pb-3 text-xs text-[var(--color-ink-muted)] italic">
          No {title.toLowerCase()} matches "{query}"
        </p>
      ) : (
        <ul className="px-1.5 pb-2 flex flex-col gap-0.5">
          {filtered.map((item) => {
            const isActive = selected === item.slug;
            const isEmpty = item.count === 0 && !isActive;
            return (
              <li key={item.slug}>
                <button
                  type="button"
                  onClick={() => onSelect(isActive ? null : item.slug)}
                  aria-pressed={isActive}
                  disabled={isEmpty}
                  className={clsx(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-sm)] text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]',
                    isActive
                      ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)] font-semibold'
                      : isEmpty
                        ? 'text-[var(--color-ink-muted)]/60 cursor-not-allowed'
                        : 'text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]',
                  )}
                >
                  {item.Icon && (
                    <item.Icon
                      width={16}
                      height={16}
                      className={clsx('flex-shrink-0', isActive ? 'text-[var(--color-brand)]' : 'text-[var(--color-ink-muted)]')}
                    />
                  )}
                  <span className="flex-1 text-left">{highlightMatch(item.label, query)}</span>
                  <span
                    className={clsx(
                      'inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full text-[11px] font-semibold tabular-nums',
                      isActive
                        ? 'bg-[var(--color-brand)] text-white'
                        : 'bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)]',
                    )}
                  >
                    {item.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </details>
  );
}

/** Wrap matched substring in a highlighted span. Case-insensitive. */
function highlightMatch(label: string, query: string) {
  const q = query.trim();
  if (!q) return label;
  const lower = label.toLowerCase();
  const idx = lower.indexOf(q.toLowerCase());
  if (idx < 0) return label;
  return (
    <>
      {label.slice(0, idx)}
      <mark className="bg-[var(--color-brand-subtle)] text-[var(--color-brand)] rounded-sm px-0.5">
        {label.slice(idx, idx + q.length)}
      </mark>
      {label.slice(idx + q.length)}
    </>
  );
}

