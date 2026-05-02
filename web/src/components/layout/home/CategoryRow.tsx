import { clsx } from 'clsx';
import type { Category } from '@/lib/utils/catalog';

interface CategoryRowProps {
  category: Category;
  isActive: boolean;
  onMouseEnter: () => void;
  onFocus: () => void;
  /** Keyboard handler: ArrowUp/Down navigate; Escape closes; Enter no-ops (panel links handle navigation). */
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  /** Ref forwarded so the parent can manage focus. */
  buttonRef?: React.Ref<HTMLButtonElement>;
}

/**
 * A single row in the vertical category strip.
 * Renders as a `<button role="menuitem">` for keyboard accessibility.
 */
export function CategoryRow({
  category,
  isActive,
  onMouseEnter,
  onFocus,
  onKeyDown,
  buttonRef,
}: CategoryRowProps) {
  const { Icon, label } = category;

  return (
    <button
      ref={buttonRef}
      role="menuitem"
      type="button"
      aria-haspopup="true"
      aria-expanded={isActive}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      className={clsx(
        // Layout
        'w-full flex items-center gap-2.5 px-3 py-2.5 text-left',
        // Typography
        'text-[var(--text-sm)] font-medium',
        // Transition
        'transition-colors duration-[var(--duration-fast)]',
        // Focus ring
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand)]',
        // Active / hover state
        isActive
          ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)]'
          : 'text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-brand)]',
      )}
    >
      {/* Icon */}
      <span
        className={clsx(
          'flex-shrink-0 transition-colors duration-[var(--duration-fast)]',
          isActive ? 'text-[var(--color-brand)]' : 'text-[var(--color-ink-muted)]',
        )}
      >
        <Icon width={16} height={16} />
      </span>

      {/* Label */}
      <span className="flex-1 min-w-0 truncate">{label}</span>

      {/* Chevron — rotates when active */}
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
        className={clsx(
          'flex-shrink-0 transition-transform duration-[var(--duration-fast)]',
          isActive
            ? 'text-[var(--color-brand)]'
            : 'text-[var(--color-ink-disabled)]',
        )}
        style={{
          transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)',
        }}
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );
}
