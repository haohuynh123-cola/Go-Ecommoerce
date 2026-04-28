import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { createProduct, updateProduct } from '@/lib/api/products';
import { Field, inputClass, InlineError, NumberInput, SectionLabel } from '@/components/ui';
import type { Product, UpdateProductPayload } from '@/lib/api/types';

const schema = z.object({
  name:        z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  sku:         z.string().min(1, 'SKU is required'),
  price:       z.coerce.number().positive('Price must be greater than 0'),
  stock:       z.coerce.number().int().min(0, 'Stock cannot be negative'),
});

type FormValues = z.infer<typeof schema>;

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isEdit = !!product;
  const [serverError, setServerError] = useState('');

  const {
    register,
    control,
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
        const patch = (Object.keys(dirtyFields) as Array<keyof FormValues>).reduce<UpdateProductPayload>(
          (acc, key) => ({ ...acc, [key]: data[key] }),
          {},
        );
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
      if (e.code === 'sku_already_exists') {
        setError('sku', { type: 'server', message: 'A product with this SKU already exists.' });
        return;
      }
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] overflow-hidden"
    >
      <div className="p-5 md:p-6 flex flex-col gap-5">
        {serverError && <InlineError message={serverError} />}

        <SectionLabel>Basics</SectionLabel>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <Field id="p-name" label="Name" error={errors.name?.message} required>
            <input
              id="p-name"
              className={inputClass(!!errors.name)}
              placeholder="iPhone 26 Pro"
              {...register('name')}
            />
          </Field>

          <Field id="p-sku" label="SKU" error={errors.sku?.message} required hint="Unique product code">
            <input
              id="p-sku"
              className={inputClass(!!errors.sku)}
              placeholder="IP26-PRO-256"
              {...register('sku')}
            />
          </Field>

          <Field id="p-price" label="Price (VND)" error={errors.price?.message} required>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <NumberInput
                  id="p-price"
                  className={inputClass(!!errors.price)}
                  placeholder="29,990,000"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  name={field.name}
                />
              )}
            />
          </Field>

          <Field id="p-stock" label="Stock" error={errors.stock?.message} required hint="Units on hand">
            <Controller
              name="stock"
              control={control}
              render={({ field }) => (
                <NumberInput
                  id="p-stock"
                  className={inputClass(!!errors.stock)}
                  placeholder="100"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  name={field.name}
                />
              )}
            />
          </Field>
        </div>

        <SectionLabel>Details</SectionLabel>

        <Field id="p-desc" label="Description" error={errors.description?.message} required>
          <textarea
            id="p-desc"
            rows={6}
            className={`${inputClass(!!errors.description)} h-auto py-3 resize-y leading-relaxed`}
            placeholder="Describe the product, key features, and what's in the box…"
            {...register('description')}
          />
        </Field>
      </div>

      <footer className="flex items-center justify-end gap-2 px-5 md:px-6 py-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)]">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-10 px-4 rounded-[var(--radius-md)] bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-10 px-5 rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-bold shadow-[var(--shadow-xs)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting
            ? (isEdit ? 'Saving…' : 'Creating…')
            : (isEdit ? 'Save changes' : 'Create product')}
        </button>
      </footer>
    </form>
  );
}

