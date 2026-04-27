import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createProduct, updateProduct } from '@/lib/api/products';
import { Button } from '@/components/ui/Button';
import { FormField, Input, Textarea } from '@/components/ui/FormField';
import { InlineError } from '@/components/ui/ErrorMessage';
import type { Product, UpdateProductPayload } from '@/lib/api/types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
});

type FormValues = z.infer<typeof schema>;

interface ProductFormModalProps {
  product?: Product;
  onSuccess: () => void;
  onClose: () => void;
}

export function ProductFormModal({ product, onSuccess, onClose }: ProductFormModalProps) {
  const isEdit = !!product;
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description,
          sku: product.sku,
          price: product.price,
          stock: product.stock,
        }
      : undefined,
  });

  async function onSubmit(data: FormValues) {
    setServerError('');
    try {
      if (isEdit && product) {
        // Only send fields the user actually changed — backend supports partial updates.
        const patch = (Object.keys(dirtyFields) as Array<keyof FormValues>).reduce<UpdateProductPayload>(
          (acc, key) => ({ ...acc, [key]: data[key] }),
          {},
        );
        // Nothing changed — nothing to send.
        if (Object.keys(patch).length === 0) {
          onSuccess();
          return;
        }
        await updateProduct(product.id, patch);
      } else {
        await createProduct(data);
      }
      onSuccess();
    } catch (err) {
      const e = err as Error & { code?: string; fieldErrors?: Record<string, string> };
      // SKU collision returns 409 with code "sku_already_exists" — surface inline
      if (e.code === 'sku_already_exists') {
        setError('sku', { type: 'server', message: 'A product with this SKU already exists.' });
        return;
      }
      // Wire other field-level validation errors from the server into RHF
      if (e.fieldErrors && Object.keys(e.fieldErrors).length > 0) {
        for (const [field, message] of Object.entries(e.fieldErrors)) {
          const key = field.toLowerCase() as keyof FormValues;
          if (key in schema.shape) {
            setError(key, { type: 'server', message });
          }
        }
      } else {
        setServerError(e.message ?? 'Save failed.');
      }
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-[oklch(18%_0.010_60/0.4)] p-8 overflow-y-auto"
      style={{ animation: 'fadeIn var(--duration-normal) var(--ease-out)' }}
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Dialog */}
      <div
        className="relative w-full max-w-[40rem] bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] flex flex-col gap-6 p-8"
        style={{ animation: 'slideUp var(--duration-slow) var(--ease-out-expo)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-4">
          <h2
            className="text-[length:var(--text-xl)] font-[var(--font-weight-normal)] text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-serif)' }}
            id="product-modal-title"
          >
            {isEdit ? 'Edit product' : 'New product'}
          </h2>
          <button
            className="w-8 h-8 flex items-center justify-center text-[length:var(--text-lg)] text-[var(--color-ink-muted)] rounded-[var(--radius-sm)] hover:text-[var(--color-ink)] hover:bg-[var(--color-accent-subtle)] transition-colors duration-[var(--duration-fast)]"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            &times;
          </button>
        </header>

        {serverError && <InlineError message={serverError} />}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* 2-column grid for paired fields */}
          <div className="grid gap-4 grid-cols-2 max-sm:grid-cols-1">
            <FormField label="Name" id="p-name" error={errors.name?.message} required>
              <Input id="p-name" hasError={!!errors.name} {...register('name')} />
            </FormField>

            <FormField label="SKU" id="p-sku" error={errors.sku?.message} required>
              <Input id="p-sku" hasError={!!errors.sku} placeholder="e.g. TS-001" {...register('sku')} />
            </FormField>

            <FormField
              label="Price (VND)"
              id="p-price"
              error={errors.price?.message}
              required
            >
              <Input
                id="p-price"
                type="number"
                min={0}
                step={1000}
                hasError={!!errors.price}
                {...register('price')}
              />
            </FormField>

            <FormField label="Stock" id="p-stock" error={errors.stock?.message} required>
              <Input
                id="p-stock"
                type="number"
                min={0}
                hasError={!!errors.stock}
                {...register('stock')}
              />
            </FormField>
          </div>

          <FormField
            label="Description"
            id="p-desc"
            error={errors.description?.message}
            required
          >
            <Textarea
              id="p-desc"
              hasError={!!errors.description}
              {...register('description')}
            />
          </FormField>

          <div className="flex gap-3 justify-end pt-2 border-t border-[var(--color-border-subtle)]">
            <Button variant="secondary" size="md" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={isSubmitting}>
              {isEdit ? 'Save changes' : 'Create product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
