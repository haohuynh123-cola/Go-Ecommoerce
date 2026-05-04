/**
 * ReviewModal — modal version of "Write a review" matching the CellphoneS-style
 * UX from the product spec. Rendered through a portal to escape any transformed
 * ancestor.
 *
 * Backend reality: the API only stores one `rating` (1–5) and one `comment`
 * string. To preserve the sub-rating UX without silently losing data, the
 * three optional facet ratings (Hiệu năng / Pin / Camera) are prepended to the
 * comment as a small structured tag block before submission. The "Thêm hình
 * ảnh" affordance is rendered as a disabled stub because there is no image
 * upload endpoint yet.
 */

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createProductComment } from '@/lib/api/comments';
import { useAuth } from '@/hooks/useAuth';
import { InlineError, Textarea } from '@/components/ui';
import { getProductPlaceholderGradient } from '@/lib/utils/product';
import type { CreateProductCommentPayload, Product } from '@/lib/api/types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Pick<Product, 'id' | 'name'>;
}

/** Overall mood labels under the 5-star picker. */
const MOOD_LABELS = ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'] as const;

/** Optional facet ratings — labels chosen to be product-agnostic enough for a generic store. */
const FACETS = [
  { key: 'performance', label: 'Hiệu năng',       hints: ['Rất kém', 'Kém', 'Tạm ổn', 'Mạnh mẽ', 'Siêu mạnh mẽ'] },
  { key: 'battery',     label: 'Thời lượng pin',  hints: ['Rất yếu', 'Yếu', 'Tạm ổn', 'Tốt',     'Cực khủng'] },
  { key: 'camera',      label: 'Chất lượng camera', hints: ['Rất kém', 'Kém', 'Tạm ổn', 'Đẹp',     'Chụp đẹp, chuyên nghiệp'] },
] as const;

type FacetKey = typeof FACETS[number]['key'];
type FacetState = Record<FacetKey, number>;
const EMPTY_FACETS: FacetState = { performance: 0, battery: 0, camera: 0 };

const MIN_LENGTH = 15;
const MAX_LENGTH = 1000;

export function ReviewModal({ isOpen, onClose, product }: ReviewModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const titleId = useId();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [facets, setFacets] = useState<FacetState>(EMPTY_FACETS);
  const [comment, setComment] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ comment?: string; rating?: string }>({});

  const mutation = useMutation({
    mutationFn: (payload: CreateProductCommentPayload) => {
      if (!user) throw new Error('Bạn cần đăng nhập để gửi đánh giá.');
      return createProductComment(product.id, user.id, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['product-comments', product.id] });
      resetState();
      onClose();
    },
  });

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !mutation.isPending) handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
    // We intentionally exclude handleClose / mutation.isPending from deps — the
    // listener reads them via closure on each event, and re-binding on every
    // pending change would churn the listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  function resetState() {
    setRating(0);
    setHoverRating(0);
    setFacets(EMPTY_FACETS);
    setComment('');
    setFieldErrors({});
  }

  function handleClose() {
    if (mutation.isPending) return;
    resetState();
    mutation.reset();
    onClose();
  }

  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    if (rating < 1 || rating > 5) errors.rating = 'Vui lòng chọn số sao đánh giá.';
    const trimmed = comment.trim();
    if (trimmed.length < MIN_LENGTH) {
      errors.comment = `Vui lòng nhập tối thiểu ${MIN_LENGTH} kí tự.`;
    } else if (trimmed.length > MAX_LENGTH) {
      errors.comment = `Đánh giá tối đa ${MAX_LENGTH} kí tự.`;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({
      comment: composeCommentBody(comment.trim(), facets),
      rating,
      parent_comment_id: null,
    });
  }

  const displayedRating = hoverRating || rating;
  const moodLabel = displayedRating > 0 ? MOOD_LABELS[displayedRating - 1] : '';
  const charsLeft = MAX_LENGTH - comment.length;
  const productGradient = getProductPlaceholderGradient(product);

  return createPortal(
    <div
      className="fixed inset-0 z-[200] grid place-items-center p-4 bg-black/55 backdrop-blur-sm"
      style={{ animation: 'fadeIn var(--duration-normal) var(--ease-out)' }}
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md max-h-[90vh] flex flex-col rounded-[var(--radius-lg)] bg-[var(--color-surface-raised)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-xl)] overflow-hidden"
        style={{ animation: 'slideUp var(--duration-slow) var(--ease-out-expo)' }}
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-subtle)]">
          <h2 id={titleId} className="text-base font-bold text-[var(--color-ink)] tracking-tight">
            Đánh giá &amp; nhận xét
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={mutation.isPending}
            aria-label="Đóng"
            className="grid place-items-center w-8 h-8 rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-lg leading-none"
          >
            ×
          </button>
        </header>

        {/* ── Body ────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5"
        >
          {/* Product card */}
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="grid place-items-center flex-shrink-0 w-12 h-12 rounded-[var(--radius-md)] text-white text-lg font-extrabold"
              style={{ background: productGradient }}
            >
              {product.name.charAt(0).toUpperCase()}
            </span>
            <p className="text-[length:var(--text-sm)] font-semibold text-[var(--color-ink)] line-clamp-2">
              {product.name}
            </p>
          </div>

          {/* Đánh giá chung */}
          <fieldset className="flex flex-col gap-2 border-none p-0 m-0">
            <legend className="text-[length:var(--text-sm)] font-semibold text-[var(--color-ink)]">
              Đánh giá chung
              <span className="text-[var(--color-error)] ml-0.5" aria-hidden>*</span>
            </legend>
            <div
              className="flex items-start justify-between gap-1"
              role="group"
              aria-label="Số sao đánh giá chung"
              onMouseLeave={() => setHoverRating(0)}
            >
              {Array.from({ length: 5 }, (_, i) => {
                const star = i + 1;
                const filled = star <= displayedRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star);
                      if (fieldErrors.rating) setFieldErrors((p) => ({ ...p, rating: undefined }));
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onFocus={() => setHoverRating(star)}
                    onBlur={() => setHoverRating(0)}
                    aria-label={`${star} sao — ${MOOD_LABELS[i]}`}
                    aria-pressed={rating === star}
                    className="flex flex-col items-center gap-1 flex-1 px-1 py-2 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-1 transition-colors"
                  >
                    <span
                      aria-hidden
                      className="text-2xl leading-none transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out)]"
                      style={{
                        color: filled ? 'var(--color-warning)' : 'var(--color-border-strong)',
                        transform: filled ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      ★
                    </span>
                    <span className="text-[length:var(--text-xs)] text-[var(--color-ink-muted)] font-medium">
                      {MOOD_LABELS[i]}
                    </span>
                  </button>
                );
              })}
            </div>
            {fieldErrors.rating && (
              <p className="text-[length:var(--text-xs)] text-[var(--color-error)]" role="alert">
                {fieldErrors.rating}
              </p>
            )}
            <p
              className="text-[length:var(--text-xs)] text-[var(--color-ink-muted)] min-h-[1em]"
              aria-live="polite"
              aria-atomic="true"
            >
              {moodLabel}
            </p>
          </fieldset>

          {/* Theo trải nghiệm */}
          <fieldset className="flex flex-col gap-2 border-none p-0 m-0">
            <legend className="text-[length:var(--text-sm)] font-semibold text-[var(--color-ink)]">
              Theo trải nghiệm
            </legend>
            <ul className="flex flex-col divide-y divide-[var(--color-border-subtle)]">
              {FACETS.map((facet) => (
                <li key={facet.key} className="grid grid-cols-[1fr,auto,1fr] items-center gap-3 py-2.5">
                  <span className="text-[length:var(--text-sm)] text-[var(--color-ink-secondary)] truncate">
                    {facet.label}
                  </span>
                  <FacetStars
                    value={facets[facet.key]}
                    onChange={(v) => setFacets((p) => ({ ...p, [facet.key]: v }))}
                    label={facet.label}
                  />
                  <span className="text-[length:var(--text-xs)] text-[var(--color-ink-muted)] truncate text-right">
                    {facets[facet.key] > 0 ? facet.hints[facets[facet.key] - 1] : ''}
                  </span>
                </li>
              ))}
            </ul>
          </fieldset>

          {/* Comment */}
          <div className="flex flex-col gap-1">
            <Textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (fieldErrors.comment) setFieldErrors((p) => ({ ...p, comment: undefined }));
              }}
              placeholder={`Xin mời chia sẻ một số cảm nhận về sản phẩm (nhập tối thiểu ${MIN_LENGTH} kí tự)`}
              rows={4}
              maxLength={MAX_LENGTH}
              hasError={!!fieldErrors.comment}
              aria-required="true"
            />
            <div className="flex items-center justify-between gap-2">
              {fieldErrors.comment ? (
                <span className="text-[length:var(--text-xs)] text-[var(--color-error)]" role="alert">
                  {fieldErrors.comment}
                </span>
              ) : (
                <span />
              )}
              <span className="text-[length:var(--text-xs)] text-[var(--color-ink-muted)] tabular-nums">
                {charsLeft} / {MAX_LENGTH}
              </span>
            </div>
          </div>

          {/* Photo upload (stub — backend not implemented) */}
          <button
            type="button"
            disabled
            title="Tính năng tải ảnh sẽ sớm ra mắt"
            className="self-start inline-flex items-center gap-2 h-9 px-3 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] text-[length:var(--text-xs)] font-semibold text-[var(--color-ink-muted)] cursor-not-allowed bg-[var(--color-surface-muted)]"
          >
            <span aria-hidden>📷</span>
            Thêm hình ảnh
          </button>

          {/* Server error */}
          {mutation.isError && (
            <InlineError
              message={(mutation.error as Error)?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.'}
            />
          )}
        </form>

        {/* ── Footer ──────────────────────────────────────────── */}
        <footer className="px-5 py-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)]">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="w-full h-11 rounded-[var(--radius-md)] bg-[var(--color-promo)] text-white text-[length:var(--text-sm)] font-bold tracking-wide uppercase hover:bg-[var(--color-promo-hover)] active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[var(--shadow-sm)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-promo)] focus-visible:outline-offset-2"
          >
            {mutation.isPending ? 'Đang gửi…' : 'Gửi đánh giá'}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

/* ───────────── Helpers ───────────── */

interface FacetStarsProps {
  value: number;
  onChange: (n: number) => void;
  label: string;
}

function FacetStars({ value, onChange, label }: FacetStarsProps) {
  return (
    <div className="inline-flex items-center gap-0.5" role="group" aria-label={`${label} — chọn sao`}>
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1;
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star === value ? 0 : star)}
            aria-label={`${star} sao`}
            aria-pressed={value === star}
            className="p-0.5 rounded-[var(--radius-sm)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-1"
          >
            <span
              aria-hidden
              className="block text-base leading-none transition-colors"
              style={{ color: filled ? 'var(--color-warning)' : 'var(--color-border-strong)' }}
            >
              ★
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Compose the final comment body, prepending a compact facet-rating block
 * when the user filled any of them. Format is human-readable but parseable
 * later if the backend grows real facet support.
 */
function composeCommentBody(comment: string, facets: FacetState): string {
  const tagged = FACETS.flatMap((f) => {
    const v = facets[f.key];
    return v > 0 ? [`${f.label}: ${v}/5`] : [];
  });
  if (tagged.length === 0) return comment;
  return `[${tagged.join(' · ')}]\n\n${comment}`;
}
