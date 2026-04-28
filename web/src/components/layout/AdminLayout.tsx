import { useEffect, useRef, useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { clsx } from 'clsx';

import { useAuth } from '@/hooks/useAuth';
import {
  IconBell,
  IconBox,
  IconChevronDown,
  IconCollapse,
  IconDashboard,
  IconLogout,
  IconMenu,
  IconReceipt,
  IconSearch,
  IconSettings,
} from './icons';

interface NavItem {
  to: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** When true, only matches the index path. */
  end?: boolean;
}

const NAV: NavItem[] = [
  { to: '/admin',          label: 'Dashboard', Icon: IconDashboard, end: true },
  { to: '/admin/products', label: 'Products',  Icon: IconBox },
  { to: '/admin/orders',   label: 'Orders',    Icon: IconReceipt },
];

const COLLAPSED_KEY = 'admin.sidebar.collapsed';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return window.localStorage.getItem(COLLAPSED_KEY) === '1'; }
    catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Persist collapsed state.
  useEffect(() => {
    try { window.localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0'); }
    catch { /* ignore */ }
  }, [collapsed]);

  // Close mobile drawer on route change.
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

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

  function handleLogout() {
    logout();
    navigate('/');
  }

  // Find current page label from NAV (best-effort).
  const currentPath = location.pathname;
  // Match longest-path-first so /admin/products beats the bare /admin index.
  const currentPage =
    [...NAV].sort((a, b) => b.to.length - a.to.length)
      .find((n) => (n.end ? currentPath === n.to : currentPath.startsWith(n.to)))
    ?? NAV[0];

  const crumbs: { to: string; label: string }[] = [{ to: '/admin', label: 'Admin' }];
  if (currentPage.to !== '/admin') {
    crumbs.push({ to: currentPage.to, label: currentPage.label });
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      {/* ─── Sidebar (desktop) ───────────────────────────────────── */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        userName={user?.name}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      {/* ─── Mobile drawer ───────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <button
            className="lg:hidden fixed inset-0 z-[140] bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <div
            className="lg:hidden fixed inset-y-0 left-0 z-[150] w-72 bg-[var(--color-sidebar)]"
            style={{ animation: 'slideUp var(--duration-normal) var(--ease-out-expo)' }}
          >
            <Sidebar
              collapsed={false}
              forceMobile
              onCloseMobile={() => setMobileOpen(false)}
              userName={user?.name}
              userEmail={user?.email}
              onLogout={handleLogout}
            />
          </div>
        </>
      )}

      {/* ─── Main column ─────────────────────────────────────────── */}
      <div
        className={clsx(
          'flex flex-col min-h-dvh transition-[padding-left] duration-300',
          collapsed ? 'lg:pl-[4.5rem]' : 'lg:pl-64',
        )}
      >

        {/* ─── Topbar ──────────────────────────────────────────── */}
        <header className="sticky top-0 z-[120] h-16 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]/95 backdrop-blur shadow-[var(--shadow-xs)]">
          <div className="h-full px-4 lg:px-6 flex items-center gap-3">
            {/* Mobile open */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden grid place-items-center w-10 h-10 rounded-md text-[var(--color-ink-secondary)] hover:text-[var(--color-brand)] hover:bg-[var(--color-brand-subtle)] transition-colors"
              aria-label="Open menu"
            >
              <IconMenu width={20} height={20} />
            </button>

            {/* Breadcrumb */}
            <nav className="hidden md:flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
              {crumbs.map((c, i) => {
                const isLast = i === crumbs.length - 1;
                return (
                  <span key={c.to} className="flex items-center gap-1.5">
                    {isLast ? (
                      <span className="font-semibold text-[var(--color-ink)]">{c.label}</span>
                    ) : (
                      <>
                        <Link to={c.to} className="text-[var(--color-ink-muted)] hover:text-[var(--color-brand)] transition-colors">
                          {c.label}
                        </Link>
                        <span aria-hidden className="text-[var(--color-border)]">/</span>
                      </>
                    )}
                  </span>
                );
              })}
            </nav>

            {/* Mobile current page */}
            <h1 className="md:hidden text-base font-bold text-[var(--color-ink)] truncate flex-1">
              {currentPage.label}
            </h1>

            {/* Spacer */}
            <span className="hidden md:block flex-1" />

            {/* Search (desktop) */}
            <div className="hidden xl:flex items-center w-64 h-9 px-3 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] text-sm">
              <IconSearch width={15} height={15} className="text-[var(--color-ink-muted)] flex-shrink-0" />
              <input
                type="search"
                placeholder="Search…"
                className="ml-2 flex-1 bg-transparent text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none"
                aria-label="Search admin"
              />
              <kbd className="ml-2 grid place-items-center h-5 px-1.5 rounded text-[10px] font-mono font-bold bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-ink-muted)]">
                ⌘K
              </kbd>
            </div>

            {/* Notifications */}
            <button
              type="button"
              className="relative grid place-items-center w-10 h-10 rounded-full text-[var(--color-ink-secondary)] hover:text-[var(--color-brand)] hover:bg-[var(--color-brand-subtle)] transition-colors"
              aria-label="Notifications"
            >
              <IconBell width={18} height={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--color-promo)] ring-2 ring-[var(--color-surface)]" />
            </button>

            {/* User menu */}
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 h-10 pl-1.5 pr-2.5 rounded-full hover:bg-[var(--color-brand-subtle)] transition-colors"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <span className="grid place-items-center w-8 h-8 rounded-full bg-[var(--color-brand)] text-white text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase() ?? 'A'}
                </span>
                <span className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-xs font-semibold text-[var(--color-ink)] truncate max-w-[12ch]">
                    {user?.name ?? 'Admin'}
                  </span>
                  <span className="text-[10px] text-[var(--color-ink-muted)]">Admin</span>
                </span>
                <IconChevronDown
                  width={14}
                  height={14}
                  className={clsx(
                    'hidden sm:block text-[var(--color-ink-muted)] transition-transform',
                    userMenuOpen && 'rotate-180',
                  )}
                />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+0.5rem)] w-60 p-2 rounded-[var(--radius-lg)] bg-[var(--color-surface-raised)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] z-[125]"
                  style={{ animation: 'dropdownIn var(--duration-normal) var(--ease-out-expo)' }}
                  role="menu"
                >
                  <div className="px-3 py-2 mb-1 border-b border-[var(--color-border-subtle)]">
                    <p className="text-xs text-[var(--color-ink-muted)]">Signed in as</p>
                    <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
                      {user?.email ?? '—'}
                    </p>
                  </div>
                  <Link to="/" role="menuitem" className={menuItemClass}>
                    View storefront
                  </Link>
                  <button type="button" role="menuitem" className={menuItemClass}>
                    Account settings
                  </button>
                  <hr className="my-1 border-t border-[var(--color-border-subtle)]" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-[var(--radius-sm)] text-sm text-[var(--color-error)] hover:bg-[var(--color-error-bg)] transition-colors flex items-center gap-2"
                  >
                    <IconLogout width={14} height={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ─── Page outlet ─────────────────────────────────────── */}
        <main className="flex-1 px-4 lg:px-6 py-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const menuItemClass =
  'block w-full text-left px-3 py-2 rounded-[var(--radius-sm)] text-sm text-[var(--color-ink-secondary)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand)] transition-colors';

// ─── Sidebar ─────────────────────────────────────────────────────────
interface SidebarProps {
  collapsed: boolean;
  forceMobile?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
  userName?: string;
  userEmail?: string;
  onLogout: () => void;
}

function Sidebar({
  collapsed,
  forceMobile = false,
  onToggleCollapse,
  onCloseMobile,
  userName,
  userEmail,
  onLogout,
}: SidebarProps) {
  const widthClass = forceMobile ? 'w-72' : collapsed ? 'w-[4.5rem]' : 'w-64';
  const isCollapsed = !forceMobile && collapsed;

  return (
    <aside
      className={clsx(
        'flex flex-col h-dvh bg-[var(--color-sidebar)] text-[var(--color-sidebar-foreground)]',
        forceMobile
          ? 'relative'
          : 'hidden lg:flex fixed top-0 left-0 z-[130] transition-[width] duration-300',
        widthClass,
      )}
      aria-label="Admin navigation"
    >
      {/* Brand */}
      <div className={clsx('flex items-center h-16 border-b border-[var(--color-sidebar-border)]', isCollapsed ? 'justify-center px-2' : 'px-5 gap-2')}>
        <Link to="/" className="flex items-center gap-2 min-w-0" aria-label="Go to storefront">
          <span className="grid place-items-center w-9 h-9 rounded-md bg-[var(--color-brand)] text-white text-sm font-extrabold flex-shrink-0 shadow-[var(--shadow-sm)]">
            E
          </span>
          {!isCollapsed && (
            <>
              <span className="text-base font-extrabold tracking-tight truncate">
                Ecomm<span className="text-[var(--color-brand)]">.</span>
              </span>
              <span className="ml-auto px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--color-brand)] border border-[var(--color-brand)]/40 rounded-md flex-shrink-0">
                Admin
              </span>
            </>
          )}
        </Link>
        {forceMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="ml-auto grid place-items-center w-9 h-9 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      {/* Section label */}
      {!isCollapsed && (
        <p className="px-5 pt-5 pb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-sidebar-dim)]">
          Workspace
        </p>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 pb-4 overflow-y-auto" aria-label="Admin sections">
        <ul className="flex flex-col gap-1">
          {NAV.map(({ to, label, Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center gap-3 rounded-[var(--radius-md)] text-sm font-medium transition-colors relative',
                    isCollapsed ? 'h-11 justify-center mx-1' : 'h-10 px-3',
                    isActive
                      ? 'bg-[var(--color-brand)]/15 text-white'
                      : 'text-[var(--color-sidebar-muted)] hover:bg-white/5 hover:text-white',
                  )
                }
                title={isCollapsed ? label : undefined}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-[var(--color-brand)]"
                      />
                    )}
                    <Icon width={18} height={18} className="flex-shrink-0" />
                    {!isCollapsed && <span className="truncate">{label}</span>}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {!isCollapsed && (
          <>
            <p className="px-3 pt-6 pb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-sidebar-dim)]">
              System
            </p>
            <ul className="flex flex-col gap-1">
              <li>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 h-10 px-3 rounded-[var(--radius-md)] text-sm font-medium text-[var(--color-sidebar-muted)] hover:bg-white/5 hover:text-white transition-colors"
                >
                  <IconSettings width={18} height={18} className="flex-shrink-0" />
                  Settings
                </button>
              </li>
            </ul>
          </>
        )}
      </nav>

      {/* User card / collapse toggle */}
      <div className="border-t border-[var(--color-sidebar-border)] p-3 flex flex-col gap-2">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 p-2 rounded-[var(--radius-md)] bg-white/5">
            <span className="grid place-items-center w-9 h-9 rounded-full bg-[var(--color-brand)] text-white text-xs font-bold flex-shrink-0">
              {userName?.charAt(0).toUpperCase() ?? 'A'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{userName ?? 'Admin'}</p>
              <p className="text-xs text-[var(--color-sidebar-muted)] truncate">{userEmail ?? ''}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="grid place-items-center w-8 h-8 rounded-md text-[var(--color-sidebar-muted)] hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Sign out"
              title="Sign out"
            >
              <IconLogout width={15} height={15} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onLogout}
            className="grid place-items-center w-full h-10 rounded-md text-[var(--color-sidebar-muted)] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Sign out"
            title="Sign out"
          >
            <IconLogout width={16} height={16} />
          </button>
        )}

        {!forceMobile && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={clsx(
              'flex items-center gap-2 h-9 rounded-md text-xs font-semibold text-[var(--color-sidebar-muted)] hover:bg-white/5 hover:text-white transition-colors',
              isCollapsed ? 'justify-center w-full' : 'px-3',
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={isCollapsed}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            <IconCollapse
              width={16}
              height={16}
              className={clsx('transition-transform', isCollapsed && 'rotate-180')}
            />
            {!isCollapsed && <span>Collapse</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
