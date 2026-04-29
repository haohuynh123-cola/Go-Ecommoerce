import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { register as registerUser, resendOtp, verifyOtp } from '@/lib/api/auth';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import {
  Field,
  inputClass,
  InlineError,
  OtpInput,
  SocialButton,
  SocialDivider,
} from '@/components/ui';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;
type Step = 'form' | 'otp';

export function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('form');
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
  const email = watch('email') ?? '';
  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  async function onSubmit(data: FormValues) {
    setServerError('');
    try {
      await registerUser(data.email, data.password, data.name);
      setStep('otp');
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
    <AuthSplitLayout hidePanel>
      {step === 'form' ? (
        <RegisterFormStep
          errors={errors}
          isSubmitting={isSubmitting}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword((s) => !s)}
          agreed={agreed}
          onToggleAgreed={(v) => setAgreed(v)}
          password={password}
          strength={strength}
          serverError={serverError}
          register={register}
          onSubmit={handleSubmit(onSubmit)}
        />
      ) : (
        <OtpStep
          email={email}
          onVerified={() => navigate('/login?registered=1')}
          onChangeEmail={() => {
            setServerError('');
            setStep('form');
          }}
        />
      )}
    </AuthSplitLayout>
  );
}

// ─── Step 1: registration form ────────────────────────────────────

interface RegisterFormStepProps {
  errors: ReturnType<typeof useForm<FormValues>>['formState']['errors'];
  isSubmitting: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
  agreed: boolean;
  onToggleAgreed: (v: boolean) => void;
  password: string;
  strength: Strength;
  serverError: string;
  register: ReturnType<typeof useForm<FormValues>>['register'];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

function RegisterFormStep({
  errors,
  isSubmitting,
  showPassword,
  onTogglePassword,
  agreed,
  onToggleAgreed,
  password,
  strength,
  serverError,
  register,
  onSubmit,
}: RegisterFormStepProps) {
  return (
    <>
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

      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
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
              onClick={onTogglePassword}
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
            onChange={(e) => onToggleAgreed(e.target.checked)}
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
    </>
  );
}

// ─── Step 2: OTP verification ─────────────────────────────────────

interface OtpStepProps {
  email: string;
  onVerified: () => void;
  onChangeEmail: () => void;
}

function OtpStep({ email, onVerified, onChangeEmail }: OtpStepProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('We sent a 6-digit code to your email.');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  async function submit(value?: string) {
    const otp = (value ?? code).trim();
    if (otp.length !== OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} digits.`);
      return;
    }
    setError('');
    setVerifying(true);
    try {
      await verifyOtp(email, otp);
      onVerified();
    } catch (err) {
      const e = err as Error;
      setError(e.message ?? 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setError('');
    setResending(true);
    try {
      await resendOtp(email);
      setInfo(`A new code was sent to ${email}.`);
      setCode('');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const e = err as Error;
      setError(e.message ?? 'Could not resend the code. Please try again shortly.');
    } finally {
      setResending(false);
    }
  }

  return (
    <>
      <header className="flex flex-col gap-1.5">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--color-ink)]">
          Verify your email
        </h1>
        <p className="text-sm text-[var(--color-ink-muted)]">
          Enter the 6-digit code we sent to{' '}
          <span className="font-semibold text-[var(--color-ink)]">{email || 'your inbox'}</span>.
        </p>
      </header>

      {error
        ? <InlineError message={error} />
        : <p className="text-xs text-[var(--color-ink-muted)]">{info}</p>}

      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => { e.preventDefault(); void submit(); }}
        noValidate
      >
        <Field
          id="otp-code"
          label="Verification code"
          required
          hint="Tip: paste the whole code at once."
        >
          <OtpInput
            value={code}
            onChange={setCode}
            onComplete={(v) => void submit(v)}
            length={OTP_LENGTH}
            hasError={!!error}
            disabled={verifying}
            autoFocus
          />
        </Field>

        <button
          type="submit"
          disabled={verifying || code.length !== OTP_LENGTH}
          className="h-12 rounded-[var(--radius-md)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-bold shadow-[var(--shadow-sm)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {verifying ? 'Verifying…' : 'Verify & continue'}
        </button>
      </form>

      <div className="flex flex-col gap-2 text-sm text-[var(--color-ink-secondary)]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[var(--color-ink-muted)]">Didn't get the email?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] disabled:text-[var(--color-ink-muted)] disabled:cursor-not-allowed transition-colors"
          >
            {resending
              ? 'Resending…'
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : 'Resend code'}
          </button>
        </div>

        <button
          type="button"
          onClick={onChangeEmail}
          className="self-start text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-brand)] transition-colors"
        >
          ← Use a different email
        </button>
      </div>
    </>
  );
}

// ─── Password strength helper ─────────────────────────────────────

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
