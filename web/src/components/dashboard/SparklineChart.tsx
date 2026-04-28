import { Skeleton } from '@/components/ui';

interface SparklineChartProps {
  /** 14 daily bucket counts, index 0 = oldest day, 13 = today. */
  data: number[];
  totalOrders: number;
  last7DayOrderCount: number;
  /** When true, replaces chart and stats with skeleton placeholders. */
  loading?: boolean;
}

export function SparklineChart({
  data,
  totalOrders,
  last7DayOrderCount,
  loading = false,
}: SparklineChartProps) {
  return (
    <div className="lg:col-span-2 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {loading ? (
            <>
              <Skeleton className="h-4 w-36" ariaLabel="Loading chart title" />
              <Skeleton className="mt-1.5 h-3 w-48" ariaLabel="Loading chart description" />
            </>
          ) : (
            <>
              <h2 className="text-base font-bold text-[var(--color-ink)] tracking-tight">
                Orders · last 14 days
              </h2>
              <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                Daily order count for your account.
              </p>
            </>
          )}
        </div>
        {loading ? (
          <Skeleton className="h-7 w-16" ariaLabel="Loading total orders" />
        ) : (
          <span className="inline-flex items-baseline gap-1 text-2xl font-extrabold text-[var(--color-ink)] tracking-tight">
            {totalOrders}
            <span className="text-xs font-semibold text-[var(--color-success)]">
              ↑ {last7DayOrderCount}
            </span>
          </span>
        )}
      </div>
      {loading ? <SparklineSkeleton /> : <Sparkline data={data} />}
    </div>
  );
}

// ─── Internal: Sparkline skeleton ────────────────────────────────────────────
//
// 14 bars at fixed varying heights — mirrors the real Sparkline geometry so the
// layout doesn't shift when data loads. No shimmer on the bars themselves to
// avoid distracting movement inside a chart area; the bars are static muted blocks.
//
const SKELETON_BAR_HEIGHTS = [30, 45, 20, 60, 35, 75, 50, 40, 65, 55, 80, 45, 70, 60];

function SparklineSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mt-5 items-end h-32"
      style={{ display: 'grid', gap: '0.25rem', gridTemplateColumns: 'repeat(14, 1fr)' }}
    >
      {SKELETON_BAR_HEIGHTS.map((h, i) => (
        <div key={i} className="relative h-full flex items-end">
          <span
            className="w-full rounded-t-md"
            style={{
              height: `${h}%`,
              backgroundColor: 'var(--color-border-subtle)',
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Internal: CSS-only bar sparkline ────────────────────────────────────────
function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(1, ...data);
  return (
    <div
      className="mt-5 items-end h-32"
      style={{ display: 'grid', gap: '0.25rem', gridTemplateColumns: `repeat(${data.length}, 1fr)` }}
    >
      {data.map((v, i) => {
        const height = Math.max(4, (v / max) * 100);
        const isLast = i === data.length - 1;
        return (
          <div key={i} className="relative h-full flex items-end">
            <span
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${height}%`,
                background: isLast
                  ? 'linear-gradient(to top, var(--color-brand), oklch(70% 0.16 252))'
                  : 'oklch(80% 0.10 252 / 0.55)',
              }}
              title={`${v} order${v === 1 ? '' : 's'}`}
            />
          </div>
        );
      })}
    </div>
  );
}
