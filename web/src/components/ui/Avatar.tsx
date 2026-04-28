import { clsx } from 'clsx';

interface AvatarProps {
  /** Free-form text — first character will be uppercased and shown. */
  name: string | undefined | null;
  /** Tailwind size scale. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Background variant. */
  tone?: 'brand' | 'neutral';
  className?: string;
}

const sizeMap = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-12 h-12 text-base',
} as const;

const toneMap = {
  brand:   'bg-[var(--color-brand)] text-white',
  neutral: 'bg-[var(--color-surface-muted)] text-[var(--color-ink)] border border-[var(--color-border)]',
} as const;

/**
 * Letter avatar. Used in user menu, sidebar user card, order rows, etc.
 * Always rounded-full, font-bold, single character.
 */
export function Avatar({ name, size = 'md', tone = 'brand', className }: AvatarProps) {
  const letter = name?.charAt(0).toUpperCase() ?? '?';
  return (
    <span
      aria-hidden
      className={clsx(
        'grid place-items-center rounded-full font-bold flex-shrink-0',
        sizeMap[size],
        toneMap[tone],
        className,
      )}
    >
      {letter}
    </span>
  );
}
