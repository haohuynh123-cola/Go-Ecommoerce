import { useState } from 'react';
import { Link } from 'react-router-dom';

import { formatRelativeTime, formatDateTime } from '@/lib/utils/format';
import { useAuth } from '@/hooks/useAuth';
import { StarRating } from './StarRating';
import { CommentForm } from './CommentForm';
import type { ProductComment } from '@/lib/api/types';

interface CommentItemProps {
  comment: ProductComment;
  productId: number;
  /** When true, Reply controls are hidden (replies cannot be replied to). */
  isReply?: boolean;
}

/**
 * Deterministic avatar background gradient derived from the first character of
 * user_name. Uses the same oklch approach as getProductPlaceholderGradient but
 * maps name chars to hue instead of a numeric id.
 */
function getAvatarGradient(name: string): string {
  const hue = ((name.charCodeAt(0) ?? 65) * 47) % 360;
  const altHue = (hue + 40) % 360;
  return `linear-gradient(135deg, oklch(58% 0.16 ${hue}), oklch(42% 0.14 ${altHue}))`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function CommentItem({ comment, productId, isReply = false }: CommentItemProps) {
  const { isAuthenticated } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);

  const avatarGradient = getAvatarGradient(comment.user_name);
  const initials = getInitials(comment.user_name);
  const relTime = formatRelativeTime(comment.created_at);
  const absTime = formatDateTime(comment.created_at);
  const hasRating = !isReply && comment.rating > 0;

  return (
    <article className="flex flex-col gap-3">
      {/* ── Header row ─────────────────────────────────────────── */}
      <header className="flex items-start gap-3">
        {/* Avatar */}
        <div
          aria-hidden="true"
          className="flex-shrink-0 w-9 h-9 rounded-full grid place-items-center text-white text-[length:var(--text-xs)] font-bold select-none"
          style={{ background: avatarGradient }}
        >
          {initials}
        </div>

        {/* Name + time */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[length:var(--text-sm)] font-semibold text-[var(--color-ink)] truncate">
            {comment.user_name}
          </span>
          <time
            dateTime={comment.created_at}
            title={absTime}
            className="text-[length:var(--text-xs)] text-[var(--color-ink-muted)]"
          >
            {relTime}
          </time>
        </div>
      </header>

      {/* ── Stars ──────────────────────────────────────────────── */}
      {hasRating && (
        <StarRating
          mode="display"
          value={comment.rating}
          label={comment.rating.toFixed(1)}
        />
      )}

      {/* ── Body ───────────────────────────────────────────────── */}
      <p className="text-[length:var(--text-sm)] text-[var(--color-ink-secondary)] leading-relaxed">
        {comment.comment}
      </p>

      {/* ── Reply button / link ─────────────────────────────────── */}
      {!isReply && (
        <div>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => setShowReplyForm((v) => !v)}
              className="text-[length:var(--text-xs)] text-[var(--color-ink-muted)] hover:text-[var(--color-brand)] transition-colors font-medium"
              aria-expanded={showReplyForm}
            >
              {showReplyForm ? 'Cancel reply' : 'Reply'}
            </button>
          ) : (
            <Link
              to="/login"
              state={{ from: { pathname: `/products/${productId}` } }}
              className="text-[length:var(--text-xs)] text-[var(--color-brand)] hover:underline font-medium"
            >
              Sign in to reply
            </Link>
          )}
        </div>
      )}

      {/* ── Inline reply form ───────────────────────────────────── */}
      {showReplyForm && !isReply && (
        <div className="mt-1 pl-0 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] p-4">
          <CommentForm
            productId={productId}
            parentId={comment.id}
            onSuccess={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* ── Replies ─────────────────────────────────────────────── */}
      {!isReply && comment.replies.length > 0 && (
        <ul className="flex flex-col gap-4 pl-8 md:pl-10 border-l-2 border-[var(--color-border-subtle)] mt-1">
          {comment.replies.map((reply) => (
            <li key={reply.id}>
              <CommentItem comment={reply} productId={productId} isReply />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
