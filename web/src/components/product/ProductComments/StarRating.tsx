/**
 * StarRating — two modes:
 *   - interactive: an accessible radio group (keyboard: arrow keys to navigate, Space/Enter to select)
 *   - display:     read-only row of filled/empty star glyphs
 */

interface StarRatingInteractiveProps {
  mode: 'interactive';
  value: number;
  onChange: (value: number) => void;
  id: string;
}

interface StarRatingDisplayProps {
  mode: 'display';
  value: number;
  /** Shown after the stars, e.g. "(4.5)". Omit to hide. */
  label?: string;
}

type StarRatingProps = StarRatingInteractiveProps | StarRatingDisplayProps;

const STAR_LABELS = ['Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];

export function StarRating(props: StarRatingProps) {
  if (props.mode === 'display') {
    const { value, label } = props;
    const floored = Math.floor(value);
    const hasFraction = value - floored >= 0.5;

    return (
      <span
        className="inline-flex items-center gap-0.5"
        aria-label={`${value.toFixed(1)} out of 5 stars`}
      >
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < floored || (i === floored && hasFraction);
          return (
            <span
              key={i}
              aria-hidden="true"
              className="text-base leading-none"
              style={{ color: filled ? 'var(--color-warning)' : 'var(--color-border-strong)' }}
            >
              ★
            </span>
          );
        })}
        {label && (
          <span className="ml-1 text-[length:var(--text-xs)] text-[var(--color-ink-muted)] font-medium">
            {label}
          </span>
        )}
      </span>
    );
  }

  // Interactive mode — radio group
  const { value, onChange, id } = props;

  return (
    <fieldset className="border-none p-0 m-0">
      <legend className="sr-only">Your rating (required)</legend>
      <div className="flex items-center gap-1" role="group" aria-label="Star rating picker">
        {Array.from({ length: 5 }, (_, i) => {
          const starValue = i + 1;
          const inputId = `${id}-star-${starValue}`;
          const filled = starValue <= value;

          return (
            <label
              key={starValue}
              htmlFor={inputId}
              className="cursor-pointer select-none touch-manipulation"
              title={STAR_LABELS[i]}
            >
              <input
                type="radio"
                id={inputId}
                name={id}
                value={starValue}
                checked={value === starValue}
                onChange={() => onChange(starValue)}
                className="sr-only"
                aria-label={`${starValue} star${starValue === 1 ? '' : 's'} — ${STAR_LABELS[i]}`}
              />
              <span
                aria-hidden="true"
                className="block text-2xl leading-none transition-[color,transform] duration-[var(--duration-fast)] ease-[var(--ease-out)]"
                style={{
                  color: filled ? 'var(--color-warning)' : 'var(--color-border-strong)',
                  transform: filled ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                ★
              </span>
            </label>
          );
        })}

        {value > 0 && (
          <span
            className="ml-2 text-[length:var(--text-xs)] font-semibold text-[var(--color-warning)]"
            aria-live="polite"
            aria-atomic="true"
          >
            {STAR_LABELS[value - 1]}
          </span>
        )}
      </div>
    </fieldset>
  );
}
