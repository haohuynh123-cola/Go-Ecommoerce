interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div
      className="flex flex-col gap-3 rounded-[var(--radius-md)] bg-[var(--color-error-bg)] border border-[var(--color-error)] p-4"
      role="alert"
    >
      <p className="text-[length:var(--text-sm)] text-[var(--color-error)]">{message}</p>
      {onRetry && (
        <button
          className="self-start text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-error)] underline underline-offset-2 hover:opacity-70 transition-opacity"
          onClick={onRetry}
          type="button"
        >
          Try again
        </button>
      )}
    </div>
  );
}

interface InlineErrorProps {
  message?: string;
}

export function InlineError({ message }: InlineErrorProps) {
  if (!message) return null;
  return (
    <div
      className="rounded-[var(--radius-sm)] bg-[var(--color-error-bg)] border border-[var(--color-error)] px-3 py-2 text-[length:var(--text-sm)] text-[var(--color-error)]"
      role="alert"
    >
      {message}
    </div>
  );
}
