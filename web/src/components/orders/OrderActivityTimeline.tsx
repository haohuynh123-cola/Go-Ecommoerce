import type { OrderActivity } from '@/lib/api/types';
import { Badge, EmptyState } from '@/components/ui';
import { IconBell } from '@/components/layout/icons';
import { formatRelativeTime, formatDateTime } from '@/lib/utils/format';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderActivityTimelineProps {
  /** Activities already loaded from the order detail response (inline). */
  activities: OrderActivity[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Maps activity_type strings to a Badge variant.
 *
 * Mapping:
 *   "Created" / "Placed"         → success  (green)
 *   "status_changed" / "update"  → info     (sky blue)
 *   cancel                       → error    (red)
 *   ship / deliver / confirm      → warning  (amber)
 *   anything else                → muted    (gray)
 */
type ActivityBadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'muted';

function activityBadgeVariant(type: string): ActivityBadgeVariant {
  const t = type.toLowerCase();
  if (t.includes('creat') || t.includes('place')) return 'success';
  if (t.includes('cancel'))                        return 'error';
  if (t.includes('deliver') || t.includes('confirm')) return 'warning';
  if (t.includes('ship'))                          return 'warning';
  if (t.includes('status') || t.includes('update') || t.includes('change')) return 'info';
  return 'muted';
}

/**
 * Converts snake_case or camelCase activity_type to a human-readable label.
 * e.g. "status_changed" → "Status Changed"
 */
function formatActivityType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Activity item ────────────────────────────────────────────────────────────

interface ActivityItemProps {
  activity: OrderActivity;
  isLast: boolean;
}

function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const relative = formatRelativeTime(activity.activity_at);
  const absolute = formatDateTime(activity.activity_at);
  const badgeVariant = activityBadgeVariant(activity.activity_type);
  const typeLabel = formatActivityType(activity.activity_type);

  return (
    <li className="activity-timeline__item">
      <span className="activity-timeline__rail" aria-hidden="true">
        <span className={`activity-timeline__dot activity-timeline__dot--${badgeVariant}`} />
        {!isLast && <span className="activity-timeline__connector" />}
      </span>
      <div className="activity-timeline__body">
        <Badge variant={badgeVariant}>{typeLabel}</Badge>
        <p className="mt-1.5 text-sm text-[var(--color-ink-secondary)] leading-snug">
          {activity.description}
        </p>
        <time
          className="mt-1 block text-xs text-[var(--color-ink-muted)] tabular-nums"
          dateTime={activity.activity_at}
          title={absolute}
        >
          {relative}
        </time>
      </div>
    </li>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders the activity log for an order as a vertical timeline.
 * Activities come from the order detail response (inline) — no separate fetch.
 * Sorts newest-first defensively (backend already returns DESC order).
 */
export function OrderActivityTimeline({ activities }: OrderActivityTimelineProps) {
  const sorted = activities.slice().sort(
    (a, b) => new Date(b.activity_at).getTime() - new Date(a.activity_at).getTime(),
  );

  return (
    <section
      className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] overflow-hidden"
      aria-labelledby="activity-log-heading"
    >
      <header className="px-5 py-4 border-b border-[var(--color-border-subtle)]">
        <h2
          id="activity-log-heading"
          className="text-base font-bold text-[var(--color-ink)]"
        >
          Activity log
        </h2>
      </header>

      <div className="px-5 py-4">
        {sorted.length === 0 ? (
          <EmptyState
            Icon={IconBell}
            title="No activity yet"
            description="Status changes and other order events will appear here."
            dashed
            size="md"
          />
        ) : (
          <ul className="activity-timeline" aria-label="Order activity log">
            {sorted.map((activity, idx) => (
              <ActivityItem
                key={`${activity.activity_type}-${activity.activity_at}-${idx}`}
                activity={activity}
                isLast={idx === sorted.length - 1}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
