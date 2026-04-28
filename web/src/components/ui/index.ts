/**
 * UI component barrel.
 *
 * Always import widgets from this module so usage stays consistent and the
 * underlying file structure can change without rewriting every page:
 *
 *   import { Card, EmptyState, PageHeader, StatusPill } from '@/components/ui';
 *
 * Document for designers / new contributors:  ../../../DESIGN-SYSTEM.md
 */

// ─── Layout / structure ──────────────────────────────────────────
export { Card } from './Card';
export { Breadcrumb } from './Breadcrumb';
export type { BreadcrumbItem } from './Breadcrumb';
export { PageHeader } from './PageHeader';
export { EmptyState } from './EmptyState';

// ─── Data display ────────────────────────────────────────────────
export { StatusPill } from './StatusPill';
export type { StatusTone } from './StatusPill';
export { StatCard } from './StatCard';
export type { StatVariant, StatDelta } from './StatCard';
export { Avatar } from './Avatar';
export { GradientThumbnail } from './GradientThumbnail';

// ─── Inputs / forms ──────────────────────────────────────────────
export { SegmentedControl } from './SegmentedControl';
export type { SegmentedOption } from './SegmentedControl';
export { SearchInput } from './SearchInput';
export { Field, SectionLabel } from './Field';

// ─── Re-exports of existing primitives (unchanged) ───────────────
export { Button } from './Button';
export { Badge } from './Badge';
export { Pagination } from './Pagination';
export { PageLoader, LoadingSpinner } from './LoadingSpinner';
export { ErrorMessage, InlineError } from './ErrorMessage';
export { ConfirmDialog } from './ConfirmDialog';
export { FormField, Input, Textarea } from './FormField';
export { inputClass, SocialButton, SocialDivider } from './form-controls';
