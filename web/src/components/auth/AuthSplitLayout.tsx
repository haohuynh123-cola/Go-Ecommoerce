import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import {
  IconHeadset,
  IconRefresh,
  IconShield,
  IconTruck,
} from '@/components/layout/icons';

interface AuthSplitLayoutProps {
  /** Left-column form content. */
  children: ReactNode;
  /** Right-column heading. Required unless `hidePanel` is true. */
  panelTitle?: string;
  /** Right-column subheading / supporting copy. Required unless `hidePanel` is true. */
  panelSubtitle?: string;
  /** Optional override for the kicker text shown above panel title. */
  panelKicker?: string;
  /** Hide the global storefront chrome by rendering on a full-bleed shell. */
  fullBleed?: boolean;
  /** Render an "Admin" tag in the brand mark (used by AdminLoginPage). */
  variant?: 'storefront' | 'admin';
  /** When true, only the form column is rendered (centered, no marketing panel). */
  hidePanel?: boolean;
}

const PANEL_FEATURES = [
  { Icon: IconTruck,   label: 'Free shipping over $99' },
  { Icon: IconRefresh, label: '30-day no-fuss returns' },
  { Icon: IconShield,  label: 'Authentic, warranty-backed' },
  { Icon: IconHeadset, label: '24/7 expert support' },
];

export function AuthSplitLayout({
  children,
  panelTitle,
  panelSubtitle,
  panelKicker = 'Welcome to Ecomm',
  fullBleed = false,
  variant = 'storefront',
  hidePanel = false,
}: AuthSplitLayoutProps) {
  const rootClass = hidePanel
    ? fullBleed
      ? 'min-h-dvh grid place-items-center bg-[var(--color-bg)]'
      : 'grid place-items-center -mx-[var(--container-padding)] -mt-8 md:-mt-10 -mb-16 min-h-[calc(100dvh-3.5rem)]'
    : fullBleed
    ? 'min-h-dvh grid lg:grid-cols-2 bg-[var(--color-bg)]'
    : 'grid lg:grid-cols-2 gap-0 -mx-[var(--container-padding)] -mt-8 md:-mt-10 -mb-16 min-h-[calc(100dvh-3.5rem)]';

  return (
    <div className={rootClass}>
      {/* ─── Form column ───────────────────────────────────────────── */}
      <section className="flex items-center justify-center px-6 py-10 md:px-10 lg:px-16 page-enter">
        <div className="w-full max-w-md flex flex-col gap-6">
          {fullBleed && (
            <Link to="/" className="inline-flex items-center gap-2 self-start" aria-label="Go to home">
              <span className="grid place-items-center w-10 h-10 rounded-md bg-[var(--color-brand)] text-white font-extrabold text-base shadow-[var(--shadow-sm)]">
                E
              </span>
              <span className="text-lg font-extrabold tracking-tight text-[var(--color-ink)]">
                Ecomm<span className="text-[var(--color-brand)]">.</span>
              </span>
              {variant === 'admin' && (
                <span className="ml-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand)] border border-[var(--color-brand)]/40 rounded-md">
                  Admin
                </span>
              )}
            </Link>
          )}
          {children}
        </div>
      </section>

      {/* ─── Marketing panel ───────────────────────────────────────── */}
      {!hidePanel && (
      <aside
        className="hidden lg:flex relative overflow-hidden flex-col justify-between p-12 text-white bg-[var(--color-sidebar)]"
        aria-hidden
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(closest-side, oklch(53% 0.18 252 / 0.55), transparent)' }}
        />
        <div
          className="absolute -bottom-32 -left-20 w-[22rem] h-[22rem] rounded-full opacity-35 blur-3xl"
          style={{ background: 'radial-gradient(closest-side, oklch(58% 0.22 27 / 0.45), transparent)' }}
        />

        {/* Top — kicker + headline */}
        <div className="relative">
          <span className="inline-flex items-center gap-2 h-8 px-3 rounded-full bg-white/10 border border-white/15 text-xs font-semibold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-promo)]" />
            {panelKicker}
          </span>
          <h2 className="mt-6 text-3xl xl:text-4xl font-extrabold tracking-tight leading-[1.1]">
            {panelTitle}
          </h2>
          <p className="mt-4 text-base text-white/70 leading-relaxed max-w-md">
            {panelSubtitle}
          </p>
        </div>

        {/* Middle — testimonial card */}
        <div className="relative my-10 hidden xl:block">
          <div className="rounded-[var(--radius-xl)] bg-white/5 border border-white/10 backdrop-blur-md p-6">
            <p className="text-base leading-relaxed text-white/90">
              "Bought my new laptop in the morning, it shipped same day. Customer service is unreal."
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="grid place-items-center w-10 h-10 rounded-full bg-[var(--color-brand)] text-white font-bold text-sm">
                M
              </div>
              <div>
                <p className="text-sm font-semibold">Minh T.</p>
                <p className="text-xs text-white/50">Verified buyer · Hà Nội</p>
              </div>
              <span className="ml-auto text-[var(--color-warning)] text-sm">★★★★★</span>
            </div>
          </div>
        </div>

        {/* Bottom — feature list */}
        <ul className="relative grid grid-cols-2 gap-3">
          {PANEL_FEATURES.map(({ Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-[var(--radius-md)] bg-white/5 border border-white/10 p-3"
            >
              <div className="grid place-items-center w-9 h-9 rounded-full bg-[var(--color-brand)]/25 text-white flex-shrink-0">
                <Icon width={18} height={18} />
              </div>
              <span className="text-sm font-medium text-white/85 leading-tight">{label}</span>
            </li>
          ))}
        </ul>
      </aside>
      )}
    </div>
  );
}
