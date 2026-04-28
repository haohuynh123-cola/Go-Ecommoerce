/**
 * Admin login uses the same /auth/login endpoint as the storefront.
 *
 * TODO: The backend has no role system. Any authenticated user can access
 * the admin panel. When the backend adds roles/permissions, add a role check
 * after login here and in RequireAuth used for admin routes.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { login } from '@/lib/api/auth';
import { useAuth } from '@/hooks/useAuth';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { Field, inputClass, InlineError } from '@/components/ui';
import { IconShield } from '@/components/layout/icons';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export function AdminLoginPage() {
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    setServerError('');
    try {
      const response = await login(data.email, data.password);
      loginSuccess(response);
      navigate('/admin');
    } catch (err) {
      const e = err as Error & { fieldErrors?: Record<string, string> };
      if (e.fieldErrors && Object.keys(e.fieldErrors).length > 0) {
        for (const [field, message] of Object.entries(e.fieldErrors)) {
          const key = field.toLowerCase() as keyof FormValues;
          if (key === 'email' || key === 'password') {
            setError(key, { type: 'server', message });
          }
        }
      } else {
        setServerError(e.message ?? 'Login failed.');
      }
    }
  }

  return (
    <AuthSplitLayout
      fullBleed
      variant="admin"
      panelKicker="Admin console"
      panelTitle="Manage your store with confidence."
      panelSubtitle="Live order tracking, instant inventory updates, and detailed analytics — all in a single dashboard."
    >
      <header className="flex flex-col gap-2.5">
        <span className="inline-flex items-center gap-2 self-start h-7 px-3 rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand)] text-[11px] font-bold uppercase tracking-widest">
          <IconShield width={13} height={13} />
          Restricted area
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--color-ink)]">
          Sign in to Admin
        </h1>
        <p className="text-sm text-[var(--color-ink-muted)]">
          {/* TODO: Restrict to admin role when backend adds role system */}
          Any registered account currently has access. Role-based permissions
          land in a future release.
        </p>
      </header>

      {serverError && <InlineError message={serverError} />}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field id="adm-email" label="Email" required error={errors.email?.message}>
          <input
            id="adm-email"
            type="email"
            autoComplete="email"
            placeholder="admin@example.com"
            aria-invalid={!!errors.email}
            className={inputClass(!!errors.email)}
            {...register('email')}
          />
        </Field>
        <Field id="adm-password" label="Password" required error={errors.password?.message}>
          <input
            id="adm-password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={!!errors.password}
            className={inputClass(!!errors.password)}
            {...register('password')}
          />
        </Field>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-12 rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-bold shadow-[var(--shadow-sm)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in to admin'}
        </button>
      </form>

      <p className="text-xs text-[var(--color-ink-muted)] text-center">
        Need a regular account?{' '}
        <a href="/" className="font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] transition-colors">
          Go to storefront
        </a>
      </p>
    </AuthSplitLayout>
  );
}
