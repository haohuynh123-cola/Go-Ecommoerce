import { Link, Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { HomeHero } from './HomeHero';

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
          <form className="mt-6 max-w-sm" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="newsletter" className="text-xs font-semibold uppercase tracking-widest text-white/70">
              Get deals in your inbox
            </label>
            <div className="mt-2 flex items-stretch gap-2">
              <input
                id="newsletter"
                type="email"
                placeholder="you@example.com"
                className="flex-1 h-11 px-4 rounded-full bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-brand)] focus:bg-white/15 transition"
              />
              <button
                type="submit"
                className="h-11 px-5 rounded-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-semibold transition-colors"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>

        {/* Link columns */}
        <FooterColumn
          title="Shop"
          links={[
            { label: 'Phones',     to: '/?name=Phones' },
            { label: 'Laptops',    to: '/?name=Laptops' },
            { label: 'Tablets',    to: '/?name=Tablets' },
            { label: 'Audio',      to: '/?name=Audio' },
            { label: 'Accessories', to: '/?name=Accessories' },
          ]}
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
