import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';

import { Button } from './Button';

type Tone = 'danger' | 'brand' | 'warning';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Visual tone of the confirm button (default `danger`). */
  tone?: Tone;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal confirmation dialog. Rendered through a portal at `document.body`
 * so it escapes any ancestor that might create a CSS containing block
 * (transform/filter/backdrop-filter/will-change). Uses `z-[200]` so the
 * backdrop sits above admin sidebar (`z-[130]`) and topbar (`z-[120]`).
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] grid place-items-center p-4 bg-black/45 backdrop-blur-sm"
      style={{ animation: 'fadeIn var(--duration-normal) var(--ease-out)' }}
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && !isLoading && onCancel()}
    >
      <div
        className="w-full max-w-md rounded-[var(--radius-lg)] bg-[var(--color-surface-raised)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-xl)]"
        style={{ animation: 'slideUp var(--duration-slow) var(--ease-out-expo)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <header className="px-6 pt-6 pb-2">
          <h2
            id="confirm-dialog-title"
            className="text-lg font-extrabold tracking-tight text-[var(--color-ink)]"
          >
            {title}
          </h2>
        </header>
        <p
          id="confirm-dialog-message"
          className="px-6 pb-5 text-sm text-[var(--color-ink-secondary)] leading-relaxed"
        >
          {message}
        </p>
        <footer
          className={clsx(
            'flex justify-end gap-2 px-5 py-4 border-t border-[var(--color-border-subtle)]',
            'bg-[var(--color-surface-muted)] rounded-b-[var(--radius-lg)]',
          )}
        >
          <Button variant="secondary" size="md" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'brand' ? 'primary' : 'danger'}
            size="md"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
