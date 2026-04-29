import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { login } from '@/lib/api/auth';
import { useAuth } from '@/hooks/useAuth';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { Field, inputClass, InlineError, SocialButton, SocialDivider } from '@/components/ui';

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
  const [showPassword, setShowPassword] = useState(false);

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
    <AuthSplitLayout hidePanel>
      <header className="flex flex-col gap-1.5">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--color-ink)]">
          Sign in
        </h1>
        <p className="text-sm text-[var(--color-ink-muted)]">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] transition-colors"
          >
            Create one
          </Link>
        </p>
      </header>

      {justRegistered && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-success)] bg-[var(--color-success-bg)] px-4 py-3 text-sm font-medium text-[var(--color-success)]">
          Account created. Sign in to continue.
        </div>
      )}

      {serverError && <InlineError message={serverError} />}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Email" id="email" error={errors.email?.message} required>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            className={inputClass(!!errors.email)}
            {...register('email')}
          />
        </Field>

        <Field
          label="Password"
          id="password"
          error={errors.password?.message}
          required
          rightSlot={
            <Link to="#forgot" className="text-xs font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] transition-colors">
              Forgot?
            </Link>
          }
        >
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={!!errors.password}
              className={`${inputClass(!!errors.password)} pr-12`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 px-2 rounded-md text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-brand)] hover:bg-[var(--color-brand-subtle)] transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </Field>

        <label className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-secondary)] cursor-pointer select-none">
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 rounded border-[var(--color-border-strong)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
          />
          Keep me signed in for 30 days
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-12 rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-bold shadow-[var(--shadow-sm)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <SocialDivider />

      <div className="grid grid-cols-2 gap-3">
        <SocialButton label="Google" disabled />
        <SocialButton label="Apple" disabled />
      </div>

      <p className="mt-2 text-xs text-[var(--color-ink-muted)] text-center">
        Social sign-in is coming soon. By signing in, you agree to our{' '}
        <a href="#terms" className="underline hover:text-[var(--color-brand)] transition-colors">Terms</a>{' '}
        and{' '}
        <a href="#privacy" className="underline hover:text-[var(--color-brand)] transition-colors">Privacy Policy</a>.
      </p>
    </AuthSplitLayout>
  );
}

