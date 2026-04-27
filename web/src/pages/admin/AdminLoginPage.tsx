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
import { Button } from '@/components/ui/Button';
import { FormField, Input } from '@/components/ui/FormField';
import { InlineError } from '@/components/ui/ErrorMessage';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
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
    <div className="min-h-dvh bg-[var(--color-sidebar)] flex items-center justify-center p-8">
      <div className="w-full max-w-sm bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-8 flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2 mb-4">
            <span
              className="text-[length:var(--text-lg)] tracking-[var(--tracking-tight)] text-[var(--color-ink)] font-[var(--font-weight-normal)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Ecomm
            </span>
            <span
              className="text-[length:var(--text-xs)] tracking-[var(--tracking-widest)] uppercase text-[var(--color-ink-muted)] px-[0.5em] py-[0.15em] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
            >
              Admin
            </span>
          </div>
          <h1
            className="text-[length:var(--text-xl)] tracking-[var(--tracking-tight)] text-[var(--color-ink)] font-[var(--font-weight-normal)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Sign in to Admin
          </h1>
          <p className="text-[length:var(--text-xs)] text-[var(--color-ink-muted)]">
            Any registered account can access the admin panel.
            {/* TODO: Restrict to admin role when backend adds role system */}
          </p>
        </header>

        {serverError && <InlineError message={serverError} />}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Email" id="adm-email" error={errors.email?.message} required>
            <Input
              id="adm-email"
              type="email"
              autoComplete="email"
              hasError={!!errors.email}
              placeholder="you@example.com"
              {...register('email')}
            />
          </FormField>

          <FormField label="Password" id="adm-password" error={errors.password?.message} required>
            <Input
              id="adm-password"
              type="password"
              autoComplete="current-password"
              hasError={!!errors.password}
              {...register('password')}
            />
          </FormField>

          <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
