import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { IconHeadset, IconRefresh, IconShield, IconTruck } from './icons';
import { CategoryMegaMenu } from './home/CategoryMegaMenu';

const FEATURES = [
  { Icon: IconTruck,   title: 'Free shipping',  sub: 'On orders over $99' },
  { Icon: IconRefresh, title: '30-day returns',  sub: 'No questions asked' },
  { Icon: IconShield,  title: '2-year warranty', sub: 'On all electronics' },
  { Icon: IconHeadset, title: '24/7 support',    sub: 'Expert help any time' },
];

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-sidebar)]">
      {/* ── Decorative gradient blobs ────────────────────────────── */}
      <div
        aria-hidden
        className="absolute -top-24 -left-16 w-[28rem] h-[28rem] rounded-full opacity-50 blur-3xl pointer-events-none"
        style={{
          background:
            'radial-gradient(closest-side, oklch(53% 0.18 252 / 0.55), transparent)',
        }}
      />
      <div
        aria-hidden
        className="absolute -bottom-28 -right-16 w-[24rem] h-[24rem] rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{
          background:
            'radial-gradient(closest-side, oklch(58% 0.22 27 / 0.45), transparent)',
        }}
      />

      <div className="container relative py-5 md:py-7">
        {/*
         * Two-column layout on lg+:
         *   Left  (18rem): CategoryMegaMenu — vertical strip + hover panel overlay.
         *   Right (1fr):   Hero copy + visual promo card.
         *
         * Below lg: stacked. Category strip becomes horizontal scroll-snap row
         * (mega-menu panels disabled on mobile — users use the header drawer).
         */}
        <div className="grid lg:grid-cols-[18rem_1fr] gap-5 items-start">

          {/* ── Left: category strip (lg+) / horizontal scroll (< lg) ── */}
          <aside aria-label="Browse by category">
            {/* Desktop: vertical strip with mega-menu */}
            <div className="hidden lg:block">
              <CategoryMegaMenu />
            </div>

            {/* Mobile / tablet: horizontal scroll-snap strip — no mega-menu */}
            <MobileCategoryScroll />
          </aside>

          {/* ── Right: full-width promo carousel ────────────────────── */}
          <PromoCarousel />
        </div>
      </div>

      {/* ── Trust feature strip ──────────────────────────────────── */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-3 py-3">
          {FEATURES.map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-2.5 text-white">
              <div className="grid place-items-center w-8 h-8 rounded-full bg-white/10 text-[var(--color-brand-subtle)] flex-shrink-0">
                <Icon width={16} height={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-tight">{title}</p>
                <p className="text-[11px] text-white/60 leading-tight mt-0.5">
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Promo visual carousel ────────────────────────────────────────────────────

interface PromoSlide {
  tag: string;
  kicker: string;
  title: string;
  price: string;
  originalPrice?: string;
  savings: string;
  ctaTo: string;
  /** CSS gradient applied behind the slide content. */
  gradient: string;
}

const PROMO_SLIDES: PromoSlide[] = [
  {
    tag: 'Hot deal',
    kicker: 'Featured today',
    title: 'iPhone 16 Pro',
    price: '$1,099',
    originalPrice: '$1,299',
    savings: 'Save $200 · Free shipping',
    ctaTo: '/?name=iPhone+16',
    gradient:
      'linear-gradient(135deg, oklch(53% 0.18 252 / 0.55), oklch(35% 0.14 270 / 0.65))',
  },
  {
    tag: 'New arrival',
    kicker: 'Just landed',
    title: 'MacBook Pro M4',
    price: '$1,899',
    originalPrice: '$2,099',
    savings: 'Save $200 · Trade-in eligible',
    ctaTo: '/?name=MacBook',
    gradient:
      'linear-gradient(135deg, oklch(45% 0.13 200 / 0.6), oklch(30% 0.12 240 / 0.7))',
  },
  {
    tag: '-30%',
    kicker: 'Flash sale',
    title: 'Sony WH-1000XM5',
    price: '$279',
    originalPrice: '$399',
    savings: 'Save $120 · Ends tonight',
    ctaTo: '/?category=audio&brand=sony',
    gradient:
      'linear-gradient(135deg, oklch(58% 0.22 27 / 0.55), oklch(38% 0.18 15 / 0.65))',
  },
  {
    tag: 'Best seller',
    kicker: 'Top rated',
    title: 'Galaxy Watch 7',
    price: '$329',
    originalPrice: '$429',
    savings: 'Save $100 · Free strap',
    ctaTo: '/?category=watches&brand=samsung',
    gradient:
      'linear-gradient(135deg, oklch(50% 0.16 160 / 0.55), oklch(32% 0.14 200 / 0.7))',
  },
];

const ROTATE_MS = 5000;

function PromoCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = PROMO_SLIDES.length;
  const reduceMotion = usePrefersReducedMotion();

  // Auto-rotate; pause on hover/focus or when reduced-motion is set.
  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % total);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion, total]);

  function go(delta: number) {
    setActive((i) => (i + delta + total) % total);
  }

  return (
    <div
      className="relative rounded-[var(--radius-2xl)] overflow-hidden border border-white/10 backdrop-blur-md bg-white/5 shadow-[var(--shadow-xl)] aspect-[16/9] md:aspect-[21/9] group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
    >
      {/* Slides — stacked, fade between via opacity. Compositor-friendly. */}
      {PROMO_SLIDES.map((slide, i) => (
        <div
          key={slide.title}
          aria-hidden={i !== active}
          className={clsx(
            'absolute inset-0 transition-opacity duration-500 ease-out',
            i === active ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
        >
          {/* Slide-specific gradient layer */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: slide.gradient }}
          />
          {/* Decorative rings */}
          <div
            aria-hidden
            className="absolute -top-20 -right-20 w-56 h-56 rounded-full border border-white/10"
          />
          <div
            aria-hidden
            className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full border border-white/10"
          />
          {/* Content */}
          <div className="absolute inset-0 grid place-items-center p-5">
            <div className="text-center text-white">
              <span className="inline-block px-2.5 h-6 leading-6 rounded-full bg-[var(--color-promo)] text-white text-[10px] font-bold uppercase tracking-widest">
                {slide.tag}
              </span>
              <p className="mt-3 text-[11px] text-white/70 font-medium uppercase tracking-widest">
                {slide.kicker}
              </p>
              <h2 className="mt-0.5 text-xl md:text-2xl font-extrabold tracking-tight">
                {slide.title}
              </h2>
              <div className="mt-2.5 flex items-baseline justify-center gap-2">
                <span className="text-2xl font-extrabold text-white">{slide.price}</span>
                {slide.originalPrice && (
                  <span className="text-sm text-white/50 line-through">{slide.originalPrice}</span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-[var(--color-promo-subtle)] font-semibold">
                {slide.savings}
              </p>
              <Link
                to={slide.ctaTo}
                tabIndex={i === active ? 0 : -1}
                className="mt-3 inline-flex items-center justify-center h-9 px-5 rounded-full bg-white text-[var(--color-sidebar)] text-xs font-bold hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
              >
                Shop now
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Prev / Next arrows — fade in on hover/focus */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        ›
      </button>

      {/* Dot indicators */}
      <ol className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {PROMO_SLIDES.map((slide, i) => (
          <li key={slide.title}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Go to slide ${i + 1}: ${slide.title}`}
              aria-current={i === active}
              className={clsx(
                'block h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70',
              )}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  const mq = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    mq.current = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.current.matches);
    const handler = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.current.addEventListener('change', handler);
    return () => mq.current?.removeEventListener('change', handler);
  }, []);

  return reduce;
}

// ─── Mobile category scroll ───────────────────────────────────────────────────

import { CATEGORIES } from '@/lib/utils/catalog';

/**
 * On screens below `lg`, the vertical category strip collapses into a
 * horizontal scroll-snap row. No mega-menu — mobile users use the header
 * navigation drawer instead.
 */
function MobileCategoryScroll() {
  return (
    <nav
      aria-label="Browse by category"
      className="lg:hidden"
    >
      <ul
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
        role="list"
      >
        {CATEGORIES.map((cat) => (
          <li
            key={cat.slug}
            style={{ scrollSnapAlign: 'start' }}
            className="flex-shrink-0"
          >
            <Link
              to={`/?category=${cat.slug}`}
              className="flex items-center gap-1.5 h-9 pl-2.5 pr-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-medium whitespace-nowrap transition-colors"
            >
              <cat.Icon
                width={14}
                height={14}
                className="text-[var(--color-brand-subtle)]"
              />
              {cat.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
