import { forwardRef } from 'react';
import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, id, error, hint, required, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase font-[var(--font-weight-medium)] text-[var(--color-ink)]"
        htmlFor={id}
      >
        {label}
        {required && (
          <span className="ml-0.5 text-[var(--color-error)]" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <span
          className="text-[length:var(--text-xs)] text-[var(--color-ink-muted)]"
          id={`${id}-hint`}
        >
          {hint}
        </span>
      )}
      {error && (
        <span
          className="text-[length:var(--text-xs)] text-[var(--color-error)]"
          id={`${id}-error`}
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError, className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx('input', hasError && 'input--error', className)}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ hasError, className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={clsx('input input--textarea', hasError && 'input--error', className)}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
