/**
 * Shared form-control primitives used by storefront + admin auth/forms pages.
 * Pure Tailwind utility composition — no per-component CSS.
 */

export function inputClass(hasError = false): string {
  return [
    'w-full h-12 px-4 rounded-[var(--radius-md)]',
    'bg-[var(--color-surface)] border-2',
    hasError ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]',
    'text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]',
    'focus:outline-none focus:border-[var(--color-brand)] focus:shadow-[var(--shadow-focus)]',
    'transition',
  ].join(' ');
}

export function SocialDivider() {
  return (
    <div className="relative flex items-center gap-3 text-xs uppercase tracking-widest text-[var(--color-ink-muted)] font-semibold">
      <span className="flex-1 h-px bg-[var(--color-border-subtle)]" />
      Or continue with
      <span className="flex-1 h-px bg-[var(--color-border-subtle)]" />
    </div>
  );
}

interface SocialButtonProps {
  label: string;
  disabled?: boolean;
}

export function SocialButton({ label, disabled }: SocialButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="h-11 grid place-items-center rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {label}
    </button>
  );
}
