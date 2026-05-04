import { useState } from 'react';
import { Link } from 'react-router-dom';

import { formatRelativeTime, formatDateTime } from '@/lib/utils/format';
import { useAuth } from '@/hooks/useAuth';
import { StarRating } from './StarRating';
import { CommentForm } from './CommentForm';
import { parseCommentFacets } from './facets';
import type { ProductComment } from '@/lib/api/types';

interface CommentItemProps {
  comment: ProductComment;
  productId: number;
  /**
   * When this item is itself a reply, this is the id of the top-level comment
   * it belongs to. Replying from a reply still posts under this top-level id
   * (the backend models replies as 1-level deep), but the new reply will be
   * pre-filled with `@<author>` so the addressee is visible.
   */
  topLevelParentId?: number;
}

/**
 * Deterministic avatar background gradient derived from the first character of
 * user_name. Uses the same oklch approach as getProductPlaceholderGradient but
 * maps name chars to hue instead of a numeric id.
 */
function getAvatarGradient(name: string | undefined | null): string {
  const seed = name && name.length > 0 ? name : '?';
  const hue = (seed.charCodeAt(0) * 47) % 360;
  const altHue = (hue + 40) % 360;
  return `linear-gradient(135deg, oklch(58% 0.16 ${hue}), oklch(42% 0.14 ${altHue}))`;
}

function getInitials(name: string | undefined | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === '') return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function CommentItem({ comment, productId, topLevelParentId }: CommentItemProps) {
  const { isAuthenticated } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);

  const isReply = topLevelParentId !== undefined;
  const displayName = comment.user_name ?? 'Anonymous';
  const avatarGradient = getAvatarGradient(displayName);
  const initials = getInitials(displayName);
  const relTime = comment.created_at ? formatRelativeTime(comment.created_at) : '';
  const absTime = comment.created_at ? formatDateTime(comment.created_at) : '';
  const rating = comment.rating ?? 0;
  const hasRating = !isReply && rating > 0;
  const replies = comment.replies ?? [];
  const { facets, body } = parseCommentFacets(comment.comment ?? '');

  // For top-level comments, replies are nested under this comment.
  // For replies, sibling replies still attach to the top-level grandparent.
  const replyParentId = isReply ? topLevelParentId : comment.id;
  // When replying to a reply, seed the textarea with an @mention so the
  // addressee is visible (the backend stays flat — no second nesting level).
  const replySeed = isReply ? `@${displayName} ` : '';

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
            {displayName}
          </span>
          <time
            dateTime={comment.created_at ?? ''}
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
          value={rating}
          label={rating.toFixed(1)}
        />
      )}

      {/* ── Facet pills (parsed from comment prefix) ────────────── */}
      {facets.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Đánh giá theo trải nghiệm">
          {facets.map((f) => (
            <li
              key={f.label}
              className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand)] border border-[var(--color-brand)]/20 text-[length:var(--text-xs)] font-semibold"
            >
              <span>{f.label}</span>
              <span aria-hidden className="opacity-50">·</span>
              <span className="inline-flex items-center gap-0.5">
                {f.value}
                <span aria-hidden className="text-[var(--color-warning)]">★</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* ── Body ───────────────────────────────────────────────── */}
      <p className="text-[length:var(--text-sm)] text-[var(--color-ink-secondary)] leading-relaxed whitespace-pre-line">
        {body}
      </p>

      {/* ── Reply button / link ─────────────────────────────────── */}
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

      {/* ── Inline reply form ───────────────────────────────────── */}
      {showReplyForm && (
        <div className="mt-2 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] p-4">
          <CommentForm
            productId={productId}
            parentId={replyParentId}
            initialValue={replySeed}
            onSuccess={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* ── Replies ─────────────────────────────────────────────── */}
      {!isReply && replies.length > 0 && (
        <ul className="flex flex-col gap-4 pl-8 md:pl-10 border-l-2 border-[var(--color-border-subtle)] mt-1">
          {replies.map((reply) => (
            <li key={reply.id}>
              <CommentItem
                comment={reply}
                productId={productId}
                topLevelParentId={comment.id}
              />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
