import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function StorefrontLayout() {
  return (
    <div className="flex flex-col min-h-dvh">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-[var(--color-border-subtle)] mt-auto">
        <div className="container flex items-center h-14">
          <span className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)]">
            Ecomm &mdash; a demo storefront
          </span>
        </div>
      </footer>
    </div>
  );
}
