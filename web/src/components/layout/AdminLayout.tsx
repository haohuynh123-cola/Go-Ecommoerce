import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { clsx } from 'clsx';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="grid min-h-dvh" style={{ gridTemplateColumns: '14rem 1fr' }}>
      {/* Sidebar */}
      <aside
        className="bg-[var(--color-sidebar)] flex flex-col p-6 sticky top-0 h-dvh overflow-y-auto"
      >
        <div className="mb-8">
          <Link to="/" className="flex items-baseline gap-2 no-underline">
            <span
              className="text-[length:var(--text-lg)] tracking-[var(--tracking-tight)] text-[var(--color-surface-raised)] font-[var(--font-weight-normal)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Ecomm
            </span>
            <span
              className="text-[length:var(--text-xs)] tracking-[var(--tracking-widest)] uppercase text-[var(--color-sidebar-dim)] px-[0.5em] py-[0.15em] border border-[var(--color-sidebar-border)] rounded-[var(--radius-sm)]"
            >
              Admin
            </span>
          </Link>
        </div>

        <nav className="flex flex-col gap-1 flex-1" aria-label="Admin navigation">
          <NavLink to="/admin" end className={adminNavLinkClass}>Dashboard</NavLink>
          <NavLink to="/admin/products" className={adminNavLinkClass}>Products</NavLink>
          <NavLink to="/admin/orders" className={adminNavLinkClass}>Orders</NavLink>
        </nav>

        <div className="mt-auto pt-6 border-t border-[var(--color-sidebar-border)]">
          <p className="text-[length:var(--text-sm)] text-[var(--color-surface-raised)] font-[var(--font-weight-medium)] mb-1 truncate">
            {user?.name}
          </p>
          <p className="text-[length:var(--text-xs)] text-[var(--color-sidebar-muted)] mb-4 truncate">
            {user?.email}
          </p>
          <button
            className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-sidebar-muted)] hover:text-[var(--color-surface-raised)] transition-colors duration-[var(--duration-normal)] bg-transparent border-none cursor-pointer p-0"
            onClick={handleLogout}
            type="button"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="bg-[var(--color-bg)] overflow-x-hidden p-8">
        <Outlet />
      </main>
    </div>
  );
}

function adminNavLinkClass({ isActive }: { isActive: boolean }) {
  return clsx(
    'block px-3 py-2 rounded-[var(--radius-sm)] text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase no-underline transition-colors duration-[var(--duration-normal)]',
    isActive
      ? 'bg-[var(--color-sidebar-hover)] text-[var(--color-surface-raised)] font-[var(--font-weight-medium)]'
      : 'text-[var(--color-sidebar-dim)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-surface-raised)]',
  );
}
