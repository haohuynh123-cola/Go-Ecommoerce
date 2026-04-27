interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <nav
      className="flex items-center justify-center gap-4 pt-10"
      aria-label="Pagination"
    >
      <button
        className="btn btn--secondary btn--sm"
        onClick={() => onPageChange(page - 1)}
        disabled={!canPrev}
        aria-label="Previous page"
      >
        Prev
      </button>

      <span className="text-[length:var(--text-sm)] text-[var(--color-ink-muted)]">
        {page}{' '}
        <span className="text-[var(--color-border)]">/</span>{' '}
        {totalPages}
      </span>

      <button
        className="btn btn--secondary btn--sm"
        onClick={() => onPageChange(page + 1)}
        disabled={!canNext}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
}
