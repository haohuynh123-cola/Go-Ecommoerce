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
  onClick?: () => void;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function SocialButton({ label, disabled, onClick, isLoading, icon }: SocialButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      onClick={onClick}
      className="h-11 grid grid-flow-col items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {icon}
      <span>{isLoading ? `${label}…` : label}</span>
    </button>
  );
}

export function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 16.2 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.5 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.6l6.2 5.2C41.5 36.4 44 30.6 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
