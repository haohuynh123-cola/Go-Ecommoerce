import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { register as registerUser } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { FormField, Input } from '@/components/ui/FormField';
import { InlineError } from '@/components/ui/ErrorMessage';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
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
      // POST /auth/register returns user info only — no token.
      // Redirect to /login with a query param so the login page shows a success message.
      await registerUser(data.email, data.password, data.name);
      navigate('/login?registered=1');
    } catch (err) {
      const e = err as Error & { fieldErrors?: Record<string, string> };
      if (e.fieldErrors && Object.keys(e.fieldErrors).length > 0) {
        for (const [field, message] of Object.entries(e.fieldErrors)) {
          const key = field.toLowerCase() as keyof FormValues;
          if (key === 'name' || key === 'email' || key === 'password') {
            setError(key, { type: 'server', message });
          }
        }
      } else {
        setServerError(e.message ?? 'Registration failed. Please try again.');
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
            Create account
          </h1>
          <p className="text-[length:var(--text-sm)] text-[var(--color-ink-muted)]">
            Join the store.
          </p>
        </header>

        {serverError && <InlineError message={serverError} />}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Full name" id="name" error={errors.name?.message} required>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              hasError={!!errors.name}
              placeholder="Your name"
              {...register('name')}
            />
          </FormField>

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

          <FormField
            label="Password"
            id="password"
            error={errors.password?.message}
            hint="Minimum 6 characters"
            required
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              hasError={!!errors.password}
              placeholder="Create a password"
              {...register('password')}
            />
          </FormField>

          <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
            Create account
          </Button>
        </form>

        <footer className="pt-4 border-t border-[var(--color-border-subtle)] text-[length:var(--text-sm)] text-[var(--color-ink-muted)] text-center">
          <p>
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[var(--color-ink)] font-[var(--font-weight-medium)] underline underline-offset-[3px] decoration-[1px] hover:opacity-65 transition-opacity"
            >
              Sign in
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
