import { Link } from 'react-router-dom';
import { IconHeadset, IconRefresh, IconShield, IconTruck } from './icons';

const FEATURES = [
  { Icon: IconTruck,   title: 'Free shipping',   sub: 'On orders over $99' },
  { Icon: IconRefresh, title: '30-day returns',  sub: 'No questions asked' },
  { Icon: IconShield,  title: '2-year warranty', sub: 'On all electronics' },
  { Icon: IconHeadset, title: '24/7 support',    sub: 'Expert help any time' },
];

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-sidebar)]">
      {/* Decorative gradient blobs */}
      <div
        aria-hidden
        className="absolute -top-24 -left-16 w-[28rem] h-[28rem] rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, oklch(53% 0.18 252 / 0.55), transparent)' }}
      />
      <div
        aria-hidden
        className="absolute -bottom-28 -right-16 w-[24rem] h-[24rem] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, oklch(58% 0.22 27 / 0.45), transparent)' }}
      />

      <div className="container relative py-7 md:py-10">
        <div className="grid lg:grid-cols-12 gap-6 items-center">
          {/* Copy */}
          <div className="lg:col-span-7 text-white">
            <span className="inline-flex items-center gap-2 h-7 px-2.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-sidebar-foreground)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-promo)]" />
              New season · 2026
            </span>

            <h1 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-extrabold leading-[1.1] tracking-tight">
              Latest tech,{' '}
              <span className="bg-gradient-to-r from-white via-[oklch(85%_0.10_252)] to-[oklch(75%_0.18_252)] bg-clip-text text-transparent">
                every day.
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-sm md:text-base text-[var(--color-sidebar-foreground)]/80 leading-relaxed">
              Shop phones, laptops, audio, and accessories from top brands.
              Up to <span className="font-bold text-white">40% off</span> selected items
              with free express shipping.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <Link
                to="/"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-bold shadow-[var(--shadow-md)] transition-colors"
              >
                Shop now
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/?name=deals"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/20 transition-colors"
              >
                View deals
              </Link>
            </div>

            {/* Trust micro-stats */}
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[var(--color-sidebar-foreground)]/70">
              <div>
                <span className="block text-lg font-extrabold text-white leading-tight">2M+</span>
                happy customers
              </div>
              <div>
                <span className="block text-lg font-extrabold text-white leading-tight">50k+</span>
                products in stock
              </div>
              <div>
                <span className="block text-lg font-extrabold text-white leading-tight">4.9★</span>
                average rating
              </div>
            </div>
          </div>

          {/* Visual card */}
          <div className="lg:col-span-5">
            <div
              className="relative rounded-[var(--radius-2xl)] overflow-hidden border border-white/10 backdrop-blur-md bg-white/5 shadow-[var(--shadow-xl)] aspect-[16/10] lg:aspect-[4/3]"
            >
              {/* Promo card content */}
              <div className="absolute inset-0 grid place-items-center p-5">
                <div className="text-center text-white">
                  <span className="inline-block px-2.5 h-6 leading-6 rounded-full bg-[var(--color-promo)] text-white text-[10px] font-bold uppercase tracking-widest">
                    Hot deal
                  </span>
                  <p className="mt-3 text-[11px] text-white/70 font-medium uppercase tracking-widest">
                    Featured today
                  </p>
                  <h2 className="mt-0.5 text-xl md:text-2xl font-extrabold tracking-tight">
                    iPhone 26 Pro
                  </h2>
                  <div className="mt-2.5 flex items-baseline justify-center gap-2">
                    <span className="text-2xl font-extrabold text-white">$1,099</span>
                    <span className="text-sm text-white/50 line-through">$1,299</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--color-promo-subtle)] font-semibold">
                    Save $200 · Free shipping
                  </p>
                  <Link
                    to="/?name=iPhone"
                    className="mt-3 inline-flex items-center justify-center h-9 px-5 rounded-full bg-white text-[var(--color-sidebar)] text-xs font-bold hover:bg-white/90 transition-colors"
                  >
                    Shop now
                  </Link>
                </div>
              </div>

              {/* Decorative ring */}
              <div
                aria-hidden
                className="absolute -top-20 -right-20 w-56 h-56 rounded-full border border-white/10"
              />
              <div
                aria-hidden
                className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full border border-white/10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Trust feature strip ──────────────────────────────── */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-3 py-3">
          {FEATURES.map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-2.5 text-white">
              <div className="grid place-items-center w-8 h-8 rounded-full bg-white/10 text-[var(--color-brand-subtle)] flex-shrink-0">
                <Icon width={16} height={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-tight">{title}</p>
                <p className="text-[11px] text-white/60 leading-tight mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
