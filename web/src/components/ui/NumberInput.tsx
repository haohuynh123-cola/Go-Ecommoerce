import { forwardRef, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, InputHTMLAttributes } from 'react';

type NativeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'>;

export interface NumberInputProps extends NativeInputProps {
  /** Current numeric value. Use `undefined` for empty. */
  value?: number | string | null;
  /** Called with the parsed numeric value (or `undefined` when cleared). */
  onChange?: (value: number | undefined) => void;
  /**
   * Locale used for thousand-separator formatting.
   * - `'en-US'` → `1,000,000`
   * - `'vi-VN'` → `1.000.000`
   * Defaults to `'en-US'`.
   */
  locale?: string;
  /** Maximum number of digits allowed (input ignored beyond this). */
  maxDigits?: number;
  /** When true, allows leading zeros (rare; default false). */
  allowLeadingZero?: boolean;
}

/**
 * Numeric input that displays a thousand-separated value as the user types,
 * while emitting raw numeric values via `onChange`.
 *
 *   <NumberInput value={price} onChange={setPrice} placeholder="29,990,000" />
 *
 * - Uses `inputMode="numeric"` so mobile shows the digit pad
 * - Strips non-digits on every keystroke
 * - Re-syncs display when external `value` changes (e.g. form reset)
 *
 * For react-hook-form, wire via `<Controller>` and pass `field.value` / `field.onChange`.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { value, onChange, locale = 'en-US', maxDigits = 15, allowLeadingZero = false, ...rest },
  ref,
) {
  const formatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const [display, setDisplay] = useState<string>(() => toDisplay(value, formatter));

  // Re-sync when value prop changes from outside (form reset, async load).
  useEffect(() => {
    setDisplay(toDisplay(value, formatter));
  }, [value, formatter]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.length > maxDigits) raw = raw.slice(0, maxDigits);
    if (!allowLeadingZero) raw = raw.replace(/^0+(?=\d)/, '');

    if (raw === '') {
      setDisplay('');
      onChange?.(undefined);
      return;
    }
    const n = Number(raw);
    if (Number.isNaN(n)) {
      setDisplay('');
      onChange?.(undefined);
      return;
    }
    setDisplay(formatter.format(n));
    onChange?.(n);
  }

  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={display}
      onChange={handleChange}
      {...rest}
    />
  );
});

function toDisplay(
  value: number | string | null | undefined,
  formatter: Intl.NumberFormat,
): string {
  if (value === undefined || value === null || value === '') return '';
  const n = typeof value === 'number' ? value : Number(String(value).replace(/\D/g, ''));
  if (Number.isNaN(n)) return '';
  return formatter.format(n);
}
