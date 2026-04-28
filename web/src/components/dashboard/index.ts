/**
 * Dashboard widget barrel.
 *
 * Reusable presentational widgets for the admin dashboard (and any future
 * analytics or order-overview pages that need the same widgets).
 *
 *   import { KpiGrid, SparklineChart, RecentOrdersPanel } from '@/components/dashboard';
 */

// ─── KPI stat grid + individual card ─────────────────────────────
export { KpiGrid } from './KpiGrid';
export { KpiCard } from './KpiCard';
export type { KpiCardProps, KpiDelta } from './KpiCard';

// ─── Chart ──────────────────────────────────────────────────────
export { SparklineChart } from './SparklineChart';

// ─── Recent orders list ──────────────────────────────────────────
export { RecentOrdersPanel, RecentOrderRow } from './RecentOrdersPanel';
