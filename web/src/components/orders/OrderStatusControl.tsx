import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';

import { updateOrderStatus } from '@/lib/api/orders';
import type { OrderStatus } from '@/lib/api/types';
import { Button, ConfirmDialog, StatusPill } from '@/components/ui';
import type { StatusTone } from '@/components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderStatusControlProps {
  orderId: number;
  /** May be a legacy value (e.g. "pending") so accept any string. */
  currentStatus: OrderStatus | string | undefined;
}

/**
 * Normalize legacy / free-form backend status strings onto the canonical OrderStatus enum
 * so the transition switch and tone mapping behave consistently.
 */
function normalizeStatus(s: string | undefined): OrderStatus | undefined {
  if (!s) return undefined;
  const lower = s.toLowerCase();
  if (lower === 'pending') return 'Created';
  if (lower === 'created')   return 'Created';
  if (lower === 'confirmed') return 'Confirmed';
  if (lower === 'shipping')  return 'Shipping';
  if (lower === 'delivered') return 'Delivered';
  if (lower === 'cancelled' || lower === 'canceled') return 'Cancelled';
  return undefined;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_TONE: Record<OrderStatus, StatusTone> = {
  Created:   'warning',  // amber — awaiting action
  Confirmed: 'brand',    // blue — locked in
  Shipping:  'info',     // sky — in transit
  Delivered: 'success',  // green — done
  Cancelled: 'error',    // red — terminated
};

/** Map a free-form backend status string (e.g. legacy "pending") onto a tone. */
function toneForStatus(status: string | undefined): StatusTone {
  if (!status) return 'neutral';
  if (status in STATUS_TONE) return STATUS_TONE[status as OrderStatus];
  // Legacy / fallback values from older rows.
  const s = status.toLowerCase();
  if (s === 'pending') return 'warning';
  if (s === 'paid' || s === 'completed') return 'success';
  if (s === 'failed' || s === 'rejected') return 'error';
  return 'neutral';
}

interface TransitionButton {
  label: string;
  targetStatus: OrderStatus;
  variant: 'primary' | 'secondary' | 'danger';
  /** Require ConfirmDialog before applying. */
  requireConfirm: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
}

/**
 * Returns the transition buttons that make sense from a given status.
 * Terminal statuses (Delivered, Cancelled) yield no buttons.
 */
function getTransitions(current: OrderStatus | undefined): TransitionButton[] {
  switch (current) {
    case 'Created':
      return [
        {
          label: 'Confirm order',
          targetStatus: 'Confirmed',
          variant: 'primary',
          requireConfirm: false,
        },
        {
          label: 'Cancel',
          targetStatus: 'Cancelled',
          variant: 'danger',
          requireConfirm: true,
          confirmTitle: 'Cancel this order?',
          confirmMessage:
            'The order will be marked as Cancelled. This action cannot be undone from the admin panel.',
        },
      ];
    case 'Confirmed':
      return [
        {
          label: 'Mark as shipping',
          targetStatus: 'Shipping',
          variant: 'primary',
          requireConfirm: false,
        },
        {
          label: 'Cancel',
          targetStatus: 'Cancelled',
          variant: 'danger',
          requireConfirm: true,
          confirmTitle: 'Cancel this order?',
          confirmMessage:
            'The order will be marked as Cancelled. This action cannot be undone from the admin panel.',
        },
      ];
    case 'Shipping':
      return [
        {
          label: 'Mark as delivered',
          targetStatus: 'Delivered',
          variant: 'primary',
          requireConfirm: false,
        },
      ];
    case 'Delivered':
    case 'Cancelled':
    case undefined:
    default:
      return [];
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Self-contained status control for the admin order detail page.
 * Displays the current status pill and available transition buttons.
 * Uses ConfirmDialog for destructive transitions (Cancel).
 */
export function OrderStatusControl({ orderId, currentStatus }: OrderStatusControlProps) {
  const queryClient = useQueryClient();
  const [pendingTransition, setPendingTransition] = useState<TransitionButton | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      void queryClient.invalidateQueries({ queryKey: ['order-activities', orderId] });
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const normalized = normalizeStatus(currentStatus);
  const transitions = getTransitions(normalized);
  const tone: StatusTone = toneForStatus(currentStatus);
  // Show the actual backend value verbatim so the pill never misrepresents the data.
  const statusLabel = currentStatus ?? 'Unknown';

  function handleTransitionClick(transition: TransitionButton) {
    if (transition.requireConfirm) {
      setPendingTransition(transition);
    } else {
      mutate(transition.targetStatus);
    }
  }

  function handleConfirm() {
    if (!pendingTransition) return;
    mutate(pendingTransition.targetStatus, {
      onSettled: () => setPendingTransition(null),
    });
  }

  function handleCancel() {
    setPendingTransition(null);
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col gap-1.5 min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-ink-muted)]">
            Status
          </span>
          <StatusPill tone={tone}>{statusLabel}</StatusPill>
        </div>

        {transitions.length > 0 && (
          <div
            className={clsx(
              'flex flex-wrap items-center gap-2',
              'sm:ml-auto',
            )}
            role="group"
            aria-label="Change order status"
          >
            {transitions.map((t) => (
              <Button
                key={t.targetStatus}
                variant={t.variant}
                size="sm"
                disabled={isPending}
                isLoading={isPending && pendingTransition?.targetStatus === t.targetStatus}
                onClick={() => handleTransitionClick(t)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        )}

        {transitions.length === 0 && currentStatus !== undefined && (
          <span className="text-xs text-[var(--color-ink-muted)] sm:ml-auto">
            No further transitions available
          </span>
        )}
      </div>

      <ConfirmDialog
        isOpen={pendingTransition !== null}
        title={pendingTransition?.confirmTitle ?? 'Confirm action'}
        message={pendingTransition?.confirmMessage ?? 'Are you sure?'}
        confirmLabel="Yes, proceed"
        cancelLabel="Cancel"
        tone="danger"
        isLoading={isPending}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
