import type { OrderStatus } from '@/lib/api/types';

interface OrderStatusTimelineProps {
  /** Current order status. May be undefined for legacy rows. */
  currentStatus: OrderStatus | string | undefined;
}

interface Step {
  status: OrderStatus;
  label: string;
}

/**
 * Linear progression of an order. Cancelled is rendered as a terminal off-flow state
 * via the wrapper, not as a step on the timeline.
 */
const STEPS: readonly Step[] = [
  { status: 'Created',   label: 'Placed' },
  { status: 'Confirmed', label: 'Confirmed' },
  { status: 'Shipping',  label: 'Shipping' },
  { status: 'Delivered', label: 'Delivered' },
];

function statusIndex(status: string | undefined): number {
  if (!status) return -1;
  // Map legacy "pending" to Created so the timeline still highlights step 0.
  if (status.toLowerCase() === 'pending') return 0;
  const i = STEPS.findIndex((s) => s.status === status);
  return i;
}

/**
 * Horizontal stepper for an order's progression: Created → Confirmed → Shipping → Delivered.
 * Completed steps render filled with a check icon and a blue connector to the next step.
 * The current step's label is bold.
 *
 * If the order is `Cancelled`, renders a single muted strip with an error chip instead.
 */
export function OrderStatusTimeline({ currentStatus }: OrderStatusTimelineProps) {
  if (currentStatus === 'Cancelled') {
    return (
      <div className="flex items-center justify-center gap-3 py-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-error-bg)] text-[var(--color-error)] text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-error)]" aria-hidden />
          Order cancelled
        </span>
      </div>
    );
  }

  const activeIdx = statusIndex(currentStatus);

  return (
    <ol
      className="flex items-start justify-between gap-2 px-2 py-2"
      aria-label="Order progress"
    >
      {STEPS.map((step, idx) => {
        const isComplete = idx <= activeIdx;
        const isCurrent = idx === activeIdx;
        const isLast = idx === STEPS.length - 1;
        const nextComplete = idx < activeIdx;

        return (
          <li
            key={step.status}
            className="flex-1 flex flex-col items-center min-w-0 relative"
            aria-current={isCurrent ? 'step' : undefined}
          >
            {/* Connector to next step — sits on the upper half so it visually connects circles */}
            {!isLast && (
              <span
                aria-hidden
                className="absolute top-3 left-1/2 right-[-50%] h-[2px] -z-0"
                style={{
                  backgroundColor: nextComplete
                    ? 'var(--color-brand)'
                    : 'var(--color-border)',
                }}
              />
            )}

            {/* Circle */}
            <span
              aria-hidden
              className="relative z-10 grid place-items-center w-6 h-6 rounded-full transition-colors"
              style={{
                backgroundColor: isComplete ? 'var(--color-brand)' : 'var(--color-surface)',
                border: isComplete
                  ? '2px solid var(--color-brand)'
                  : '2px solid var(--color-border)',
                color: isComplete ? '#fff' : 'var(--color-ink-muted)',
              }}
            >
              {isComplete ? (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2.5 6.5l2.5 2.5 4.5-5" />
                </svg>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              )}
            </span>

            {/* Label */}
            <span
              className={
                'mt-1.5 text-[11px] leading-tight text-center truncate max-w-full ' +
                (isCurrent
                  ? 'font-bold text-[var(--color-ink)]'
                  : isComplete
                    ? 'font-medium text-[var(--color-ink-secondary)]'
                    : 'text-[var(--color-ink-muted)]')
              }
              title={step.label}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
