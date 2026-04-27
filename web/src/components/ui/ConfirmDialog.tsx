import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/40 backdrop-blur-sm"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <dialog
        className="relative bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] w-full max-w-sm p-6 flex flex-col gap-4"
        open
        aria-labelledby="dialog-title"
        aria-modal="true"
      >
        <h2
          className="font-[var(--font-serif)] text-[length:var(--text-lg)] text-[var(--color-ink)] font-[var(--font-weight-normal)]"
          id="dialog-title"
        >
          {title}
        </h2>
        <p className="text-[length:var(--text-sm)] text-[var(--color-ink-secondary)]">
          {message}
        </p>
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </dialog>
    </div>
  );
}
