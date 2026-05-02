import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { Header } from './Header';
import { HomeHero } from './HomeHero';
import { CATEGORIES } from '@/lib/utils/catalog';

export function StorefrontLayout() {
  const { pathname, search } = useLocation();
  // Show the hero only on the bare home (no search/filter applied).
  const showHero = pathname === '/' && !search;

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg)]">
      <Header />
      {showHero && <HomeHero />}
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-16 bg-[var(--color-sidebar)] text-[var(--color-sidebar-foreground)]">
      <div className="container py-12 md:py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-12">
        {/* Brand column */}
        <div className="lg:col-span-4">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-9 h-9 rounded-md bg-[var(--color-brand)] text-white font-extrabold text-sm">
              E
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              Ecomm<span className="text-[var(--color-brand)]">.</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-sm">
            The place to shop the latest phones, laptops, and tech accessories.
            Authentic products, expert support, and fast nationwide shipping.
          </p>
          <NewsletterForm />
        </div>

        {/* Link columns */}
        <FooterColumn
          title="Shop"
          links={CATEGORIES.map((c) => ({ label: c.label, to: `/?category=${c.slug}` }))}
        />
        <FooterColumn
          title="Support"
          links={[
            { label: 'Contact us',     href: '#contact' },
            { label: 'Shipping',       href: '#shipping' },
            { label: 'Returns',        href: '#returns' },
            { label: 'Warranty',       href: '#warranty' },
            { label: 'FAQ',            href: '#faq' },
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            { label: 'About us', href: '#about' },
            { label: 'Stores',   href: '#stores' },
            { label: 'Careers',  href: '#careers' },
            { label: 'Press',    href: '#press' },
            { label: 'Affiliates', href: '#affiliates' },
          ]}
        />
      </div>

      {/* Bottom strip */}
      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Ecomm. A demo storefront. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {['VISA', 'MC', 'AMEX', 'PayPal', 'Apple Pay'].map((label) => (
              <span
                key={label}
                className="grid place-items-center h-7 px-2.5 rounded-md bg-white/10 border border-white/15 text-[10px] font-bold tracking-wider text-white/70"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Newsletter form ─────────────────────────────────────────────
//
// TODO(backend): wire to a real `POST /newsletter/subscribe` endpoint.
// For now, validates client-side and persists the subscribed email in
// localStorage so a returning visitor sees the "already subscribed" state.

const NEWSLETTER_KEY = 'ecommce.newsletter_email';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type NewsletterStatus = 'idle' | 'submitting' | 'success' | 'error' | 'subscribed';

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<NewsletterStatus>('idle');
  const [message, setMessage] = useState('');

  // On mount: if the user has already subscribed on this device, show that.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(NEWSLETTER_KEY);
      if (saved && EMAIL_RE.test(saved)) {
        setEmail(saved);
        setStatus('subscribed');
      }
    } catch {
      /* localStorage unavailable — keep idle */
    }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    setMessage('');

    try {
      // Simulated network call; replace with real API when the backend ships.
      await new Promise((resolve) => setTimeout(resolve, 600));
      window.localStorage.setItem(NEWSLETTER_KEY, trimmed);
      setStatus('success');
      setMessage('You\'re in. Watch your inbox for deals.');
    } catch {
      setStatus('error');
      setMessage('Something went wrong — please try again.');
    }
  }

  function handleUnsubscribe() {
    try {
      window.localStorage.removeItem(NEWSLETTER_KEY);
    } catch {
      /* ignore */
    }
    setEmail('');
    setStatus('idle');
    setMessage('');
  }

  const isSubmitting = status === 'submitting';
  const isDone = status === 'success' || status === 'subscribed';

  return (
    <form className="mt-6 max-w-sm" onSubmit={handleSubmit} noValidate>
      <label
        htmlFor="newsletter"
        className="text-xs font-semibold uppercase tracking-widest text-white/70"
      >
        Get deals in your inbox
      </label>
      <div className="mt-2 flex items-stretch gap-2">
        <input
          id="newsletter"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error' || status === 'success') {
              setStatus('idle');
              setMessage('');
            }
          }}
          disabled={isSubmitting || isDone}
          aria-invalid={status === 'error'}
          aria-describedby="newsletter-msg"
          placeholder="you@example.com"
          className="flex-1 h-11 px-4 rounded-full bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-brand)] focus:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed transition"
        />
        <button
          type="submit"
          disabled={isSubmitting || isDone}
          aria-live="polite"
          className={clsx(
            'h-11 px-5 rounded-full text-white text-sm font-semibold transition-colors disabled:cursor-not-allowed',
            isDone
              ? 'bg-[var(--color-success)] hover:bg-[var(--color-success)]'
              : 'bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] disabled:opacity-70',
          )}
        >
          {isSubmitting ? 'Subscribing…' : isDone ? 'Subscribed ✓' : 'Subscribe'}
        </button>
      </div>

      <p
        id="newsletter-msg"
        role={status === 'error' ? 'alert' : 'status'}
        aria-live="polite"
        className={clsx(
          'mt-2 text-xs min-h-[1.25rem]',
          status === 'error' && 'text-[var(--color-error)]',
          status === 'success' && 'text-[var(--color-success)]',
          status === 'subscribed' && 'text-white/60',
          (status === 'idle' || status === 'submitting') && 'text-white/50',
        )}
      >
        {status === 'subscribed'
          ? `You're subscribed as ${email}.`
          : message || (status === 'idle' ? 'No spam — unsubscribe any time.' : '')}
      </p>

      {status === 'subscribed' && (
        <button
          type="button"
          onClick={handleUnsubscribe}
          className="mt-1 text-[11px] font-semibold text-white/55 hover:text-white underline-offset-4 hover:underline transition-colors"
        >
          Unsubscribe
        </button>
      )}
    </form>
  );
}

type FooterLink = { label: string; to?: string; href?: string };

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="lg:col-span-2">
      <h3 className="text-xs font-bold uppercase tracking-widest text-white">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            {link.to ? (
              <Link
                to={link.to}
                className="text-sm text-white/65 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                className="text-sm text-white/65 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
