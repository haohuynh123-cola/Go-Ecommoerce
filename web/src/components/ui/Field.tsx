import type { ReactNode } from 'react';

interface FieldProps {
  id: string;
  label: ReactNode;
  /** Validation error. Takes precedence over `hint`. */
  error?: ReactNode;
  /** Helper text shown when there's no error. */
  hint?: ReactNode;
  required?: boolean;
  /** Right-aligned content next to the label (e.g. "Forgot?" link). */
  rightSlot?: ReactNode;
  /** The actual control — `<input>`, `<textarea>`, etc. Style with `inputClass()`. */
  children: ReactNode;
  className?: string;
}

/**
 * Label + control + error/hint stack used by every form on the site.
 * The control is your responsibility — pair it with `inputClass()` from `form-controls`.
 */
export function Field({
  id,
  label,
  error,
  hint,
  required,
  rightSlot,
  children,
  className,
}: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-[var(--color-ink-secondary)]">
          {label}
          {required && <span className="ml-0.5 text-[var(--color-error)]" aria-hidden> *</span>}
        </label>
        {rightSlot}
      </div>
      {children}
      {error
        ? <p className="text-xs text-[var(--color-error)]" role="alert">{error}</p>
        : hint
        ? <p className="text-xs text-[var(--color-ink-muted)]">{hint}</p>
        : null}
    </div>
  );
}

/**
 * Small uppercase section divider used inside long forms / panels:
 *   <SectionLabel>Basics</SectionLabel>
 */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
      {children}
    </p>
  );
}
