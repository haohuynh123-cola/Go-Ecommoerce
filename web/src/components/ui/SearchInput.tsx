import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { clsx } from 'clsx';

import { IconSearch } from '@/components/layout/icons';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Visual size of the input. */
  size?: 'sm' | 'md';
}

/**
 * Search input with a magnifier icon prefixed inside the box.
 * Background is `surface-muted` until focus, then jumps to `surface-raised` —
 * the focus jump is intentional and matches the header search.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ size = 'md', className, placeholder = 'Search…', ...rest }, ref) => {
    const heightClass = size === 'sm' ? 'h-9 pl-8 pr-3 text-sm' : 'h-10 pl-9 pr-3 text-sm';
    const iconLeft = size === 'sm' ? 'left-2.5' : 'left-3';
    const iconSize = size === 'sm' ? 14 : 15;
    return (
      <div className={clsx('relative', className)}>
        <IconSearch
          width={iconSize}
          height={iconSize}
          className={`absolute ${iconLeft} top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] pointer-events-none`}
        />
        <input
          ref={ref}
          type="search"
          placeholder={placeholder}
          className={clsx(
            'w-full rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] border border-transparent',
            'text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]',
            'focus:outline-none focus:border-[var(--color-brand)] focus:bg-[var(--color-surface-raised)] focus:shadow-[var(--shadow-focus)]',
            'transition',
            heightClass,
          )}
          {...rest}
        />
      </div>
    );
  },
);
SearchInput.displayName = 'SearchInput';
