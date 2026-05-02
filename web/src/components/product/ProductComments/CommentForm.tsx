import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createProductComment } from '@/lib/api/comments';
import { InlineError } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { StarRating } from './StarRating';
import type { CreateProductCommentPayload } from '@/lib/api/types';

interface CommentFormProps {
  productId: number;
  /** When set, this is a reply form — rating control is hidden, parent_comment_id is set. */
  parentId?: number;
  /** Called after a successful submission (e.g. to collapse the inline reply box). */
  onSuccess?: () => void;
}

const MIN_LENGTH = 5;
const MAX_LENGTH = 1000;

export function CommentForm({ productId, parentId, onSuccess }: CommentFormProps) {
  const isReply = parentId !== undefined;
  const queryClient = useQueryClient();

  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<{ comment?: string; rating?: string }>({});
  const [successMsg, setSuccessMsg] = useState('');

  const mutation = useMutation({
    mutationFn: (payload: CreateProductCommentPayload) =>
      createProductComment(productId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['product-comments', productId] });
      setComment('');
      setRating(0);
      setFieldErrors({});
      setSuccessMsg(isReply ? 'Reply posted!' : 'Review posted — thank you!');
      setTimeout(() => setSuccessMsg(''), 3000);
      onSuccess?.();
    },
    onError: (err: Error) => {
      // Surface backend field-level errors if present
      const fieldErr = (err as Error & { fieldErrors?: Record<string, string> }).fieldErrors;
      if (fieldErr) {
        setFieldErrors({
          comment: fieldErr['comment'],
          rating: fieldErr['rating'],
        });
      }
    },
  });

  function validate(): boolean {
    const errors: { comment?: string; rating?: string } = {};
    if (comment.trim().length < MIN_LENGTH) {
      errors.comment = `Please write at least ${MIN_LENGTH} characters.`;
    }
    if (comment.trim().length > MAX_LENGTH) {
      errors.comment = `Review must be ${MAX_LENGTH} characters or fewer.`;
    }
    if (!isReply && (rating < 1 || rating > 5)) {
      errors.rating = 'Please select a star rating.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({
      comment: comment.trim(),
      rating: isReply ? 0 : rating,
      parent_comment_id: parentId ?? null,
    });
  }

  const charsLeft = MAX_LENGTH - comment.length;
  const charsNearLimit = charsLeft <= 100;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4"
      aria-label={isReply ? 'Post a reply' : 'Write a review'}
    >
      {/* Star picker — top-level only */}
      {!isReply && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase font-semibold text-[var(--color-ink)]">
            Your rating <span className="text-[var(--color-error)]" aria-hidden="true">*</span>
          </label>
          <StarRating
            mode="interactive"
            id={`rating-${productId}${parentId ? `-reply-${parentId}` : ''}`}
            value={rating}
            onChange={setRating}
          />
          {fieldErrors.rating && (
            <span className="text-[length:var(--text-xs)] text-[var(--color-error)]" role="alert">
              {fieldErrors.rating}
            </span>
          )}
        </div>
      )}

      {/* Comment textarea */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`comment-body-${productId}-${parentId ?? 'top'}`}
          className="text-[length:var(--text-xs)] tracking-[var(--tracking-wide)] uppercase font-semibold text-[var(--color-ink)]"
        >
          {isReply ? 'Your reply' : 'Your review'}
          <span className="text-[var(--color-error)] ml-0.5" aria-hidden="true">*</span>
        </label>
        <Textarea
          id={`comment-body-${productId}-${parentId ?? 'top'}`}
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            if (fieldErrors.comment) setFieldErrors((p) => ({ ...p, comment: undefined }));
          }}
          placeholder={isReply ? 'Write a reply…' : 'Share your experience with this product…'}
          rows={isReply ? 3 : 4}
          maxLength={MAX_LENGTH}
          hasError={!!fieldErrors.comment}
          aria-describedby={
            fieldErrors.comment
              ? `comment-error-${productId}`
              : `comment-counter-${productId}`
          }
          aria-required="true"
        />
        <div className="flex items-center justify-between gap-2">
          <span
            id={`comment-error-${productId}`}
            className={`text-[length:var(--text-xs)] ${fieldErrors.comment ? 'text-[var(--color-error)]' : 'hidden'}`}
            role={fieldErrors.comment ? 'alert' : undefined}
          >
            {fieldErrors.comment}
          </span>
          <span
            id={`comment-counter-${productId}`}
            className={`ml-auto text-[length:var(--text-xs)] tabular-nums transition-colors ${
              charsNearLimit
                ? 'text-[var(--color-warning-text)] font-semibold'
                : 'text-[var(--color-ink-muted)]'
            }`}
            aria-live="polite"
            aria-atomic="true"
          >
            {charsLeft} / {MAX_LENGTH}
          </span>
        </div>
      </div>

      {/* Server error */}
      {mutation.isError && !fieldErrors.comment && !fieldErrors.rating && (
        <InlineError message={(mutation.error as Error).message ?? 'Something went wrong.'} />
      )}

      {/* Success confirmation */}
      {successMsg && (
        <p
          role="status"
          className="text-[length:var(--text-sm)] text-[var(--color-success)] font-semibold"
        >
          {successMsg}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="h-9 px-5 rounded-[var(--radius-md)] bg-[var(--color-brand)] text-white text-[length:var(--text-sm)] font-semibold hover:bg-[var(--color-brand-hover)] active:bg-[var(--color-brand-active)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-2"
        >
          {mutation.isPending
            ? isReply ? 'Posting…' : 'Submitting…'
            : isReply ? 'Post reply' : 'Submit review'}
        </button>
        {isReply && onSuccess && (
          <button
            type="button"
            onClick={onSuccess}
            className="text-[length:var(--text-sm)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
