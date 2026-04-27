import { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '@/lib/api/auth';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { FormField, Input } from '@/components/ui/FormField';
import { InlineError } from '@/components/ui/ErrorMessage';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/';
  const justRegistered = searchParams.get('registered') === '1';

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
      navigate(from, { replace: true });
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
        setServerError(e.message ?? 'Login failed. Please try again.');
      }
    }
  }

  return (
    <div
      className="flex items-start justify-center px-[var(--container-padding)] page-enter"
      style={{ paddingBlock: '4rem', minHeight: 'calc(100dvh - 3.5rem)' }}
    >
      <div className="w-full max-w-[26rem] flex flex-col gap-6">
        <header className="border-b border-[var(--color-border-subtle)] pb-6">
          <h1
            className="text-[length:var(--text-2xl)] tracking-[var(--tracking-tight)] text-[var(--color-ink)] font-[var(--font-weight-normal)] mb-1"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Sign in
          </h1>
          <p className="text-[length:var(--text-sm)] text-[var(--color-ink-muted)]">
            Welcome back.
          </p>
        </header>

        {justRegistered && (
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-success-bg)] border border-[var(--color-success)] px-3 py-2 text-[length:var(--text-sm)] text-[var(--color-success)]">
            Account created. Sign in to continue.
          </div>
        )}

        {serverError && <InlineError message={serverError} />}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Email" id="email" error={errors.email?.message} required>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              hasError={!!errors.email}
              placeholder="you@example.com"
              {...register('email')}
            />
          </FormField>

          <FormField label="Password" id="password" error={errors.password?.message} required>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              hasError={!!errors.password}
              placeholder="Your password"
              {...register('password')}
            />
          </FormField>

          <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
            Sign in
          </Button>
        </form>

        <footer className="pt-4 border-t border-[var(--color-border-subtle)] text-[length:var(--text-sm)] text-[var(--color-ink-muted)] text-center">
          <p>
            No account?{' '}
            <Link
              to="/register"
              className="text-[var(--color-ink)] font-[var(--font-weight-medium)] underline underline-offset-[3px] decoration-[1px] hover:opacity-65 transition-opacity"
            >
              Register
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
