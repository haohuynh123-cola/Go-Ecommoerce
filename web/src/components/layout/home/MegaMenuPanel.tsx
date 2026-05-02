import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import type { MegaMenuPanel as MegaMenuPanelData, MegaMenuColumn } from '@/lib/utils/megaMenu';

interface MegaMenuPanelProps {
  panel: MegaMenuPanelData;
  categoryLabel: string;
  isVisible: boolean;
  onLinkClick: () => void;
}

/**
 * The hover overlay panel that appears to the right of the category strip.
 *
 * Slides in from the left (translate-x) and fades when becoming visible —
 * compositor-friendly transform + opacity only.
 * `prefers-reduced-motion` zeroes the duration tokens globally in globals.css,
 * so the animation naturally collapses to instant.
 */
export function MegaMenuPanel({
  panel,
  categoryLabel,
  isVisible,
  onLinkClick,
}: MegaMenuPanelProps) {
  return (
    <div
      role="region"
      aria-label={`${categoryLabel} menu`}
      // Visibility driven by isVisible; pointer-events disabled when hidden
      // so phantom hover zones don't block the content behind.
      className={clsx(
        // Position: flush-left of strip container, layered above
        'absolute top-0 left-full z-50',
        // Sizing — min-h to match strip height; self-stretches to content
        'min-h-full',
        // Visual surface
        'bg-[var(--color-surface-raised)]',
        'border border-[var(--color-border-subtle)]',
        'rounded-r-[var(--radius-lg)] rounded-tl-none rounded-bl-none',
        'shadow-[var(--shadow-lg)]',
        // Motion: slide + fade
        'transition-[opacity,transform]',
        'duration-200',
        'ease-out',
        isVisible
          ? 'opacity-100 translate-x-0 pointer-events-auto'
          : 'opacity-0 -translate-x-1 pointer-events-none',
      )}
      style={{
        width: 'min(56rem, calc(100vw - 18rem))',
      }}
    >
      {/* ── Inner scroll container (in case panel is taller than strip) */}
      <div className="h-full overflow-y-auto overflow-x-hidden p-5">
        {/* Header */}
        <h3 className="text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-ink-muted)] mb-4">
          {categoryLabel}
        </h3>

        {/* Columns grid */}
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${panel.columns.length + (panel.featuredCard ? 1 : 0)}, minmax(10rem, 1fr))`,
          }}
        >
          {panel.columns.map((col) => (
            <PanelColumn
              key={col.title}
              column={col}
              onLinkClick={onLinkClick}
            />
          ))}

          {/* Featured card */}
          {panel.featuredCard && (
            <FeaturedCard
              title={panel.featuredCard.title}
              subtitle={panel.featuredCard.subtitle}
              to={panel.featuredCard.to}
              onLinkClick={onLinkClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────

interface PanelColumnProps {
  column: MegaMenuColumn;
  onLinkClick: () => void;
}

function PanelColumn({ column, onLinkClick }: PanelColumnProps) {
  return (
    <div className="min-w-0">
      {/* Column heading */}
      <p className="text-[10px] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-ink-disabled)] mb-2.5">
        {column.title}
      </p>

      {/* Brand pills — 2-col pill grid */}
      {column.brands && (
        <ul className="grid grid-cols-2 gap-1.5" role="list">
          {column.brands.map((brand) => (
            <li key={brand.slug}>
              <Link
                to={brand.to}
                onClick={onLinkClick}
                className={clsx(
                  'flex items-center justify-center h-8 px-2',
                  'rounded-[var(--radius-sm)]',
                  'border border-[var(--color-border-subtle)]',
                  'bg-[var(--color-surface-muted)]',
                  'text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-wide)]',
                  'text-[var(--color-ink-secondary)]',
                  'transition-colors duration-[var(--duration-fast)]',
                  'hover:bg-[var(--color-brand-subtle)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]',
                )}
              >
                {brand.label}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Text links — vertical list */}
      {column.links && (
        <ul className="flex flex-col gap-0.5" role="list">
          {column.links.map((link) => (
            <li key={link.label}>
              <Link
                to={link.to}
                onClick={onLinkClick}
                className={clsx(
                  'block py-1 px-1.5 -mx-1.5',
                  'text-[var(--text-sm)] text-[var(--color-ink-secondary)]',
                  'rounded-[var(--radius-xs)]',
                  'transition-colors duration-[var(--duration-fast)]',
                  'hover:text-[var(--color-brand)] hover:bg-[var(--color-brand-subtle)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]',
                  // Subtle underline on hover via box-shadow (compositor-friendly)
                  'hover:underline underline-offset-2',
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Featured card ────────────────────────────────────────────────────────────

interface FeaturedCardProps {
  title: string;
  subtitle: string;
  to: string;
  onLinkClick: () => void;
}

function FeaturedCard({ title, subtitle, to, onLinkClick }: FeaturedCardProps) {
  return (
    <div className="min-w-0 flex flex-col justify-between">
      <p className="text-[10px] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-ink-disabled)] mb-2.5">
        Hot deal
      </p>
      <Link
        to={to}
        onClick={onLinkClick}
        className={clsx(
          'group flex-1 flex flex-col justify-end gap-3',
          'p-4 rounded-[var(--radius-md)]',
          'relative overflow-hidden',
          'transition-[box-shadow,transform] duration-[var(--duration-normal)]',
          'hover:shadow-[var(--shadow-md)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]',
        )}
        style={{
          background:
            'linear-gradient(135deg, var(--color-brand-subtle) 0%, oklch(93% 0.04 27) 100%)',
        }}
      >
        {/* Decorative circle */}
        <span
          aria-hidden
          className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-20"
          style={{ background: 'var(--color-brand)' }}
        />
        <span
          aria-hidden
          className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-15"
          style={{ background: 'var(--color-promo)' }}
        />

        {/* Promo tag */}
        <span
          className="self-start inline-flex items-center h-5 px-2 rounded-[var(--radius-xs)] text-[10px] font-bold uppercase tracking-[var(--tracking-wide)]"
          style={{
            background: 'var(--color-promo)',
            color: 'var(--color-promo-foreground)',
          }}
        >
          Sale
        </span>

        {/* Text */}
        <div>
          <p className="text-[var(--text-sm)] font-extrabold text-[var(--color-ink)] leading-tight">
            {title}
          </p>
          <p className="mt-0.5 text-[var(--text-xs)] text-[var(--color-ink-secondary)] leading-snug">
            {subtitle}
          </p>
          <span
            className={clsx(
              'mt-2.5 inline-flex items-center gap-1',
              'text-[var(--text-xs)] font-semibold text-[var(--color-brand)]',
              'transition-gap duration-[var(--duration-fast)]',
              'group-hover:gap-2',
            )}
          >
            Shop now
            <svg
              aria-hidden
              width={12}
              height={12}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </Link>
    </div>
  );
}
