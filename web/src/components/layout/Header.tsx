import { useEffect, useRef, useState } from 'react';
import type { ComponentType, FormEvent, SVGProps } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';

import { useAuth } from '@/hooks/useAuth';
import { getCartItems } from '@/lib/api/cart';
import {
  IconAccessory,
  IconCamera,
  IconCart,
  IconChevronDown,
  IconHeadphones,
  IconHotline,
  IconLaptop,
  IconMenu,
  IconMonitor,
  IconPhone,
  IconSearch,
  IconStore,
  IconTablet,
  IconUser,
  IconWatch,
} from './icons';

type CategoryItem = {
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const CATEGORIES: CategoryItem[] = [
  { label: 'Phones',      Icon: IconPhone },
  { label: 'Laptops',     Icon: IconLaptop },
  { label: 'Tablets',     Icon: IconTablet },
  { label: 'Watches',     Icon: IconWatch },
  { label: 'Audio',       Icon: IconHeadphones },
  { label: 'Cameras',     Icon: IconCamera },
  { label: 'Monitors',    Icon: IconMonitor },
  { label: 'Accessories', Icon: IconAccessory },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Close user menu on outside click.
  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [userMenuOpen]);

  // Cart count — only fetch when authenticated.
  const { data: cartItems } = useQuery({
    queryKey: ['cart'],
    queryFn: getCartItems,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
  const cartCount = cartItems?.reduce((sum, it) => sum + (it.quantity ?? 0), 0) ?? 0;

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = searchValue.trim();
    navigate(q ? `/?name=${encodeURIComponent(q)}` : '/');
    setMobileOpen(false);
  }

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-[100]">
      {/* ─── Announcement bar ───────────────────────────────────── */}
      <div className="bg-[var(--color-sidebar)] text-[var(--color-sidebar-foreground)]">
        <div className="container flex items-center justify-between h-9 text-xs">
          <div className="flex items-center gap-2 text-[var(--color-sidebar-muted)]">
            <IconHotline width={14} height={14} />
            <span className="hidden sm:inline">
              Free shipping on orders over <span className="text-white font-semibold">$99</span>
              <span className="mx-2 text-[var(--color-sidebar-dim)]">·</span>
              30-day easy returns
            </span>
            <span className="sm:hidden text-white font-semibold">Free shipping over $99</span>
          </div>
          <div className="flex items-center gap-5 text-[var(--color-sidebar-muted)]">
            <a href="tel:18001234" className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors">
              <IconHotline width={13} height={13} />
              1800 1234
            </a>
            <a href="#stores" className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors">
              <IconStore width={13} height={13} />
              Find a store
            </a>
            <Link to="/orders" className="hover:text-white transition-colors">Track order</Link>
          </div>
        </div>
      </div>

      {/* ─── Main bar ──────────────────────────────────────────── */}
      <div
        className="border-b border-[var(--color-border-subtle)] shadow-[var(--shadow-xs)]"
        style={{
          backgroundColor: 'oklch(100% 0 0 / 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="container flex items-center gap-4 lg:gap-8 h-16">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 -ml-2 text-[var(--color-ink-secondary)] hover:text-[var(--color-brand)] rounded-md"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            <IconMenu width={22} height={22} />
          </button>

          {/* Wordmark */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0" aria-label="Go to home">
            <span className="grid place-items-center w-9 h-9 rounded-md bg-[var(--color-brand)] text-white font-extrabold text-sm shadow-[var(--shadow-sm)]">
              E
            </span>
            <span className="hidden sm:inline text-lg font-extrabold tracking-tight text-[var(--color-ink)]">
              Ecomm<span className="text-[var(--color-brand)]">.</span>
            </span>
          </Link>

          {/* Search bar — centerpiece */}
          <form
            onSubmit={handleSearch}
            role="search"
            className="flex-1 max-w-2xl"
          >
            <div className="relative flex items-stretch">
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search phones, laptops, accessories…"
                className="w-full h-11 pl-11 pr-28 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-brand)] focus:bg-[var(--color-surface-raised)] focus:shadow-[var(--shadow-focus)] transition"
                aria-label="Search products"
              />
              <IconSearch
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]"
                width={18}
                height={18}
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-4 rounded-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-xs font-semibold transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right: cart + user */}
          <div className="flex items-center gap-2 ml-auto">
            <Link
              to="/cart"
              className="relative grid place-items-center w-11 h-11 rounded-full text-[var(--color-ink-secondary)] hover:text-[var(--color-brand)] hover:bg-[var(--color-brand-subtle)] transition-colors"
              aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
            >
              <IconCart width={22} height={22} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full bg-[var(--color-promo)] text-white text-[10px] font-bold leading-5 text-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div ref={userMenuRef} className="relative">
                <button
                  className="flex items-center gap-2 h-11 pl-2 pr-3 rounded-full hover:bg-[var(--color-brand-subtle)] transition-colors"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                >
                  <span className="grid place-items-center w-8 h-8 rounded-full bg-[var(--color-brand)] text-white font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden md:inline text-sm font-medium text-[var(--color-ink)] max-w-[10ch] overflow-hidden text-ellipsis whitespace-nowrap">
                    {user?.name}
                  </span>
                  <IconChevronDown
                    width={16}
                    height={16}
                    className={clsx(
                      'hidden md:block text-[var(--color-ink-muted)] transition-transform',
                      userMenuOpen && 'rotate-180',
                    )}
                  />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-[calc(100%+0.5rem)] min-w-[14rem] p-2 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] z-[110]"
                    style={{ animation: 'dropdownIn var(--duration-normal) var(--ease-out-expo)' }}
                    role="menu"
                  >
                    <div className="px-3 py-2 border-b border-[var(--color-border-subtle)] mb-1">
                      <p className="text-xs text-[var(--color-ink-muted)]">Signed in as</p>
                      <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/orders"
                      role="menuitem"
                      className="block px-3 py-2 rounded-[var(--radius-sm)] text-sm text-[var(--color-ink-secondary)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand)] transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My orders
                    </Link>
                    <Link
                      to="/admin"
                      role="menuitem"
                      className="block px-3 py-2 rounded-[var(--radius-sm)] text-sm text-[var(--color-ink-secondary)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand)] transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Admin panel
                    </Link>
                    <hr className="my-1 border-t border-[var(--color-border-subtle)]" />
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 rounded-[var(--radius-sm)] text-sm text-[var(--color-error)] hover:bg-[var(--color-error-bg)] transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-1.5 h-11 px-3 text-sm font-medium text-[var(--color-ink-secondary)] hover:text-[var(--color-brand)] transition-colors"
                >
                  <IconUser width={18} height={18} />
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="h-11 px-4 grid place-items-center rounded-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-semibold transition-colors shadow-[var(--shadow-xs)]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ─── Category strip (desktop) ──────────────────────────── */}
        <nav
          className="hidden lg:block border-t border-[var(--color-border-subtle)]"
          aria-label="Categories"
        >
          <div className="container flex items-center gap-1 h-12 overflow-x-auto">
            <NavLink to="/" end className={categoryLinkClass}>
              All products
            </NavLink>
            {CATEGORIES.map(({ label, Icon }) => (
              <NavLink
                key={label}
                to={`/?name=${encodeURIComponent(label)}`}
                className={categoryLinkClass}
              >
                <Icon width={16} height={16} />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* ─── Mobile drawer ─────────────────────────────────────── */}
        {mobileOpen && (
          <div
            className="lg:hidden border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)]"
            style={{ animation: 'dropdownIn var(--duration-normal) var(--ease-out-expo)' }}
          >
            <div className="container py-3 flex flex-col gap-1">
              <NavLink
                to="/"
                end
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)]'
                      : 'text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]',
                  )
                }
              >
                All products
              </NavLink>
              {CATEGORIES.map(({ label, Icon }) => (
                <NavLink
                  key={label}
                  to={`/?name=${encodeURIComponent(label)}`}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)]'
                        : 'text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]',
                    )
                  }
                >
                  <Icon width={18} height={18} />
                  {label}
                </NavLink>
              ))}
              {!isAuthenticated && (
                <div className="flex gap-2 mt-2 sm:hidden">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 grid place-items-center h-10 rounded-md border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink)]"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 grid place-items-center h-10 rounded-md bg-[var(--color-brand)] text-white text-sm font-semibold"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function categoryLinkClass({ isActive }: { isActive: boolean }) {
  return clsx(
    'flex items-center gap-2 px-3 h-9 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
    isActive
      ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)]'
      : 'text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]',
  );
}
