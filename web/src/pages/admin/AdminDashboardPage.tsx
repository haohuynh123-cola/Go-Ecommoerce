import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listProducts } from '@/lib/api/products';
import { listOrders } from '@/lib/api/orders';
import { formatPrice } from '@/lib/utils/format';

export function AdminDashboardPage() {
  const { data: productsData } = useQuery({
    queryKey: ['admin-products-summary'],
    queryFn: () => listProducts({ page: 1, page_size: 1 }),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: listOrders,
  });

  const totalRevenue = orders.reduce((acc, o) => acc + o.total_amount, 0);

  return (
    <div className="flex flex-col gap-8 page-enter">
      <header className="border-b border-[var(--color-border-subtle)] pb-6">
        <p className="kicker">Overview</p>
        <h1 className="page-title">Dashboard</h1>
      </header>

      {/* Stats */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))' }}
      >
        <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 flex flex-col gap-2">
          <p className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)]">
            Total products
          </p>
          <p
            className="text-[length:var(--text-2xl)] font-[var(--font-weight-normal)] text-[var(--color-ink)] tracking-[var(--tracking-tight)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {productsData?.pagination?.total_items ?? '—'}
          </p>
          <Link
            to="/admin/products"
            className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-secondary)] no-underline mt-auto pt-3 hover:text-[var(--color-accent)] transition-colors duration-[var(--duration-normal)]"
          >
            Manage &rarr;
          </Link>
        </div>

        <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 flex flex-col gap-2">
          <p className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)]">
            Your orders
          </p>
          <p
            className="text-[length:var(--text-2xl)] font-[var(--font-weight-normal)] text-[var(--color-ink)] tracking-[var(--tracking-tight)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {orders.length}
          </p>
          <Link
            to="/admin/orders"
            className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-secondary)] no-underline mt-auto pt-3 hover:text-[var(--color-accent)] transition-colors duration-[var(--duration-normal)]"
          >
            View &rarr;
          </Link>
        </div>

        <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 flex flex-col gap-2">
          <p className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase text-[var(--color-ink-muted)]">
            Order revenue
          </p>
          <p
            className="text-[length:var(--text-2xl)] font-[var(--font-weight-normal)] text-[var(--color-ink)] tracking-[var(--tracking-tight)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {formatPrice(totalRevenue)}
          </p>
          <p className="text-[length:var(--text-xs)] text-[var(--color-ink-muted)] mt-auto pt-3">
            Your orders only
          </p>
        </div>
      </div>

      {/* Notice */}
      <div className="bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] rounded-[var(--radius-md)] px-5 py-4">
        <p className="text-[length:var(--text-sm)] text-[var(--color-warning-text)] leading-[var(--leading-normal)]">
          The backend&apos;s{' '}
          <code className="font-mono text-[0.9em] bg-[oklch(93%_0.06_80)] px-[0.4em] py-[0.1em] rounded-[3px]">
            GET /orders/
          </code>{' '}
          endpoint returns only orders for the currently authenticated user.
          A global admin order list is not yet available.
          {/* TODO: update when backend adds a role-gated admin orders endpoint */}
        </p>
      </div>
    </div>
  );
}
