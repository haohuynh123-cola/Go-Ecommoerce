import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { register as registerUser } from '@/lib/api/auth';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { Field, inputClass, InlineError, SocialButton, SocialDivider } from '@/components/ui';

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const password = watch('password') ?? '';
  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  async function onSubmit(data: FormValues) {
    setServerError('');
    try {
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
    <AuthSplitLayout
      panelKicker="Join Ecomm"
      panelTitle="Create an account in 30 seconds."
      panelSubtitle="Get exclusive member deals, faster checkout, and 24/7 support from real humans."
    >
      <header className="flex flex-col gap-1.5">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--color-ink)]">
          Create account
        </h1>
        <p className="text-sm text-[var(--color-ink-muted)]">
          Already have one?{' '}
          <Link
            to="/login"
            className="font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </header>

      {serverError && <InlineError message={serverError} />}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field id="name" label="Full name" error={errors.name?.message} required>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Nguyễn Văn A"
            aria-invalid={!!errors.name}
            className={inputClass(!!errors.name)}
            {...register('name')}
          />
        </Field>

        <Field id="email" label="Email" error={errors.email?.message} required>
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

        <Field id="password" label="Password" error={errors.password?.message} required>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="At least 6 characters"
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
          {password.length > 0 && <PasswordStrengthMeter strength={strength} />}
        </Field>

        <label className="inline-flex items-start gap-2 text-sm text-[var(--color-ink-secondary)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-[var(--color-border-strong)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
          />
          <span>
            I agree to the{' '}
            <a href="#terms" className="font-semibold text-[var(--color-brand)] hover:underline">Terms of Service</a>{' '}
            and{' '}
            <a href="#privacy" className="font-semibold text-[var(--color-brand)] hover:underline">Privacy Policy</a>.
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting || !agreed}
          className="mt-2 h-12 rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-bold shadow-[var(--shadow-sm)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <SocialDivider />

      <div className="grid grid-cols-2 gap-3">
        <SocialButton label="Google" disabled />
        <SocialButton label="Apple" disabled />
      </div>
    </AuthSplitLayout>
  );
}

interface Strength {
  /** 0–4 */
  score: number;
  label: 'Too weak' | 'Weak' | 'Okay' | 'Good' | 'Strong';
  /** Bare CSS variable name (e.g. "--color-brand"). */
  cssVar: string;
}

const STRENGTH_LEVELS: Strength[] = [
  { score: 0, label: 'Too weak', cssVar: '--color-error' },
  { score: 1, label: 'Weak',     cssVar: '--color-error' },
  { score: 2, label: 'Okay',     cssVar: '--color-warning' },
  { score: 3, label: 'Good',     cssVar: '--color-brand' },
  { score: 4, label: 'Strong',   cssVar: '--color-success' },
];

function evaluatePasswordStrength(pw: string): Strength {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return STRENGTH_LEVELS[Math.min(4, score)];
}

function PasswordStrengthMeter({ strength }: { strength: Strength }) {
  const filledColor = `var(${strength.cssVar})`;
  return (
    <div className="mt-1.5">
      <div className="grid grid-cols-4 gap-1">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className="h-1.5 rounded-full transition-colors"
            style={{
              backgroundColor: step <= strength.score ? filledColor : 'var(--color-border-subtle)',
            }}
          />
        ))}
      </div>
      <p className="mt-1 text-[11px] font-semibold" style={{ color: filledColor }}>
        Password strength: {strength.label}
      </p>
    </div>
  );
}
