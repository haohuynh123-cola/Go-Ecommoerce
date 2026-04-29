import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';

interface OtpInputProps {
  /** Current value, e.g. "123456" or "12  ". */
  value: string;
  onChange: (next: string) => void;
  /** Called the moment all `length` slots are filled with digits. */
  onComplete?: (value: string) => void;
  length?: number;
  hasError?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  ariaLabel?: string;
}

/**
 * Segmented numeric OTP input. Renders `length` 1-char boxes with
 * auto-advance, backspace-to-previous, and full-paste support.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  hasError = false,
  disabled = false,
  autoFocus = false,
  ariaLabel = 'One-time passcode',
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const slots = Array.from({ length }, (_, i) => value[i] ?? '');

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  function setDigit(index: number, digit: string) {
    const next = (slots.slice(0, index).join('') + digit + slots.slice(index + 1).join('')).slice(0, length);
    onChange(next);
    if (next.length === length && /^\d+$/.test(next)) onComplete?.(next);
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1);
    if (!digit) {
      setDigit(index, '');
      return;
    }
    setDigit(index, digit);
    if (index < length - 1) inputsRef.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (slots[index]) {
        setDigit(index, '');
        return;
      }
      if (index > 0) {
        e.preventDefault();
        inputsRef.current[index - 1]?.focus();
        setDigit(index - 1, '');
      }
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
    if (pasted.length === length) onComplete?.(pasted);
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex items-center gap-2 sm:gap-2.5"
    >
      {slots.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          pattern="[0-9]*"
          value={digit}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-label={`Digit ${i + 1} of ${length}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.currentTarget.select()}
          className={[
            'w-11 sm:w-12 h-12 sm:h-14 rounded-[var(--radius-md)] text-center',
            'bg-[var(--color-surface)] border-2',
            hasError ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]',
            'text-lg sm:text-xl font-bold tabular-nums text-[var(--color-ink)]',
            'focus:outline-none focus:border-[var(--color-brand)] focus:shadow-[var(--shadow-focus)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition',
          ].join(' ')}
        />
      ))}
    </div>
  );
}
