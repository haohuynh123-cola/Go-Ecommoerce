import { CommentItem } from './CommentItem';
import { Skeleton } from '@/components/ui';
import type { ProductComment } from '@/lib/api/types';

interface CommentListProps {
  comments: ProductComment[];
  productId: number;
}

interface CommentListSkeletonProps {
  rows?: number;
}

export function CommentList({ comments, productId }: CommentListProps) {
  return (
    <ul className="flex flex-col divide-y divide-[var(--color-border-subtle)]">
      {comments.map((comment) => (
        <li key={comment.id} className="py-5 first:pt-0 last:pb-0">
          <CommentItem comment={comment} productId={productId} />
        </li>
      ))}
    </ul>
  );
}

export function CommentListSkeleton({ rows = 3 }: CommentListSkeletonProps) {
  return (
    <ul className="flex flex-col divide-y divide-[var(--color-border-subtle)]" aria-busy="true" aria-label="Loading reviews">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="py-5 first:pt-0 last:pb-0">
          <div className="flex flex-col gap-3">
            {/* Avatar + name row */}
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" ariaLabel="Loading reviewer avatar" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton className="h-3.5 w-28" ariaLabel="Loading reviewer name" />
                <Skeleton className="h-3 w-16" ariaLabel="Loading timestamp" />
              </div>
            </div>
            {/* Stars */}
            <Skeleton className="h-4 w-24" ariaLabel="Loading star rating" />
            {/* Body lines */}
            <Skeleton className="h-3.5 w-full" ariaLabel="Loading review text" />
            <Skeleton className="h-3.5 w-4/5" ariaLabel="Loading review text" />
            {i % 2 === 0 && <Skeleton className="h-3.5 w-3/5" ariaLabel="Loading review text" />}
          </div>
        </li>
      ))}
    </ul>
  );
}
