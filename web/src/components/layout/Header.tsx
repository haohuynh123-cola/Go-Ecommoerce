import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { clsx } from 'clsx';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <header
      className="sticky top-0 z-[100] border-b border-[var(--color-border-subtle)]"
      style={{ backgroundColor: 'oklch(99% 0.004 75 / 0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      <div className="container flex items-center gap-8 h-14">
        {/* Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-[0.3em] flex-shrink-0"
          aria-label="Go to storefront"
        >
          <span
            className="text-[length:var(--text-lg)] tracking-[var(--tracking-tight)] text-[var(--color-ink)] font-[var(--font-weight-normal)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Ecomm
          </span>
          <span
            className="w-[5px] h-[5px] rounded-full bg-[var(--color-accent)] mb-[0.1em] flex-shrink-0"
            aria-hidden="true"
          />
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-6 flex-1" aria-label="Main navigation">
          <NavLink to="/" end className={navLinkClass}>
            Products
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/cart" className={navLinkClass}>Cart</NavLink>
              <NavLink to="/orders" className={navLinkClass}>Orders</NavLink>
            </>
          ) : null}
        </nav>

        {/* Auth section */}
        <div className="ml-auto">
          {isAuthenticated ? (
            <div className="relative">
              <button
                className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-1"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <span
                  className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-secondary)] max-w-[12ch] overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {user?.name}
                </span>
                <span
                  className="w-8 h-8 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-border)] flex items-center justify-center text-[length:var(--text-xs)] font-[var(--font-weight-semibold)] text-[var(--color-accent)] flex-shrink-0"
                  aria-hidden="true"
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </button>

              {menuOpen && (
                <div
                  className="absolute top-[calc(100%+0.5rem)] right-0 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-md)] min-w-[14rem] p-2 z-[110]"
                  style={{ animation: `dropdownIn var(--duration-normal) var(--ease-out-expo)` }}
                  role="menu"
                  aria-label="User menu"
                  onBlur={() => setMenuOpen(false)}
                >
                  <Link
                    to="/admin"
                    role="menuitem"
                    className="block w-full text-left px-3 py-2 rounded-[var(--radius-sm)] text-[length:var(--text-sm)] text-[var(--color-ink-secondary)] no-underline hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-ink)] transition-colors duration-[var(--duration-fast)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                  <hr className="border-none border-t border-[var(--color-border-subtle)] my-2" />
                  <button
                    className="block w-full text-left px-3 py-2 rounded-[var(--radius-sm)] text-[length:var(--text-sm)] text-[var(--color-error)] bg-transparent border-none cursor-pointer hover:bg-[var(--color-error-bg)] transition-colors duration-[var(--duration-fast)]"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] transition-colors duration-[var(--duration-normal)]"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-surface-raised)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] px-4 py-1 rounded-[var(--radius-sm)] transition-colors duration-[var(--duration-normal)]"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function navLinkClass({ isActive }: { isActive: boolean }) {
  return clsx(
    'text-[length:var(--text-xs)] tracking-[var(--tracking-widest)] uppercase no-underline transition-colors duration-[var(--duration-normal)] py-1',
    'relative after:content-[""] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-px after:bg-[var(--color-accent)] after:transition-transform after:duration-[var(--duration-normal)] after:origin-left',
    isActive
      ? 'text-[var(--color-ink)] after:scale-x-100'
      : 'text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] after:scale-x-0',
  );
}
