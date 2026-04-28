import { clsx } from 'clsx';
import { getProductPlaceholderGradient } from '@/lib/utils/product';

interface GradientThumbnailProps {
  /** Drives the deterministic gradient hue. */
  id: number;
  /** Letter shown over the gradient. Pass the product name and the first char is used. */
  name?: string | null;
  /** Tailwind size class set. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Visual shape. `square` is the default. */
  shape?: 'square' | 'round';
  className?: string;
}

const sizeClassMap = {
  xs: 'w-8 h-8 text-sm',
  sm: 'w-10 h-10 text-base',
  md: 'w-12 h-12 text-lg',
  lg: 'w-20 h-20 text-2xl',
  xl: 'w-24 h-24 text-3xl',
} as const;

/**
 * Deterministic gradient placeholder used in place of a real product image.
 * Hue is derived from `id` so the same product always gets the same colour.
 *
 * Replace with `<img src={...} />` when the backend exposes a real image URL.
 */
export function GradientThumbnail({
  id,
  name,
  size = 'sm',
  shape = 'square',
  className,
}: GradientThumbnailProps) {
  const letter = name?.charAt(0).toUpperCase() ?? '·';
  return (
    <div
      className={clsx(
        'relative overflow-hidden flex-shrink-0',
        shape === 'round' ? 'rounded-full' : 'rounded-[var(--radius-md)]',
        sizeClassMap[size],
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ background: getProductPlaceholderGradient({ id }) }}
      />
      <span
        aria-hidden
        className="absolute inset-0 grid place-items-center text-white/95 font-extrabold tracking-tight drop-shadow-sm select-none"
      >
        {letter}
      </span>
    </div>
  );
}
