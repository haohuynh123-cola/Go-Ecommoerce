import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { login, resendOtp, verifyOtp } from '@/lib/api/auth';
import { useAuth } from '@/hooks/useAuth';
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import {
  ConfirmDialog,
  Field,
  inputClass,
  InlineError,
  OtpInput,
  SocialButton,
  SocialDivider,
} from '@/components/ui';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;
const ERR_CODE_EMAIL_NOT_VERIFIED = 'email_not_verified';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;
type Step = 'form' | 'otp';

interface PendingCredentials {
  email: string;
  password: string;
}

export function LoginPage() {
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/';
  const justRegistered = searchParams.get('registered') === '1';

  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [pending, setPending] = useState<PendingCredentials | null>(null);
  const [verifyPrompt, setVerifyPrompt] = useState<PendingCredentials | null>(null);
  const [confirmingVerify, setConfirmingVerify] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function performLogin(credentials: PendingCredentials) {
    const response = await login(credentials.email, credentials.password);
    loginSuccess(response);
    navigate(from, { replace: true });
  }

  async function onSubmit(data: FormValues) {
    setServerError('');
    try {
      await performLogin(data);
    } catch (err) {
      const e = err as Error & {
        code?: string;
        fieldErrors?: Record<string, string>;
      };

      if (e.code === ERR_CODE_EMAIL_NOT_VERIFIED) {
        // Ask the user before redirecting to the OTP form.
        setVerifyPrompt({ email: data.email, password: data.password });
        return;
      }

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

  async function handleConfirmVerify() {
    if (!verifyPrompt || confirmingVerify) return;
    setConfirmingVerify(true);
    // Trigger a fresh OTP for the unverified account; ignore failures here
    // because the user can still use "Resend code" from the OTP step.
    try {
      await resendOtp(verifyPrompt.email);
    } catch {
      // no-op
    }
    setPending(verifyPrompt);
    setStep('otp');
    setVerifyPrompt(null);
    setConfirmingVerify(false);
  }

  function handleCancelVerify() {
    if (confirmingVerify) return;
    setVerifyPrompt(null);
  }

  if (step === 'otp' && pending) {
    return (
      <AuthSplitLayout hidePanel>
        <LoginOtpStep
          email={pending.email}
          onVerified={async () => {
            try {
              await performLogin(pending);
            } catch (err) {
              const e = err as Error;
              setServerError(e.message ?? 'Login failed. Please try again.');
              setStep('form');
              setPending(null);
            }
          }}
          onChangeEmail={() => {
            setServerError('');
            setPending(null);
            setStep('form');
          }}
        />
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout hidePanel>
      <ConfirmDialog
        isOpen={verifyPrompt !== null}
        title="Verify your email"
        message={
          verifyPrompt
            ? `Your account (${verifyPrompt.email}) hasn't been verified yet. Do you want to go to the verification form now?`
            : ''
        }
        confirmLabel="Verify now"
        cancelLabel="Not now"
        tone="brand"
        isLoading={confirmingVerify}
        onConfirm={handleConfirmVerify}
        onCancel={handleCancelVerify}
      />

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

// ─── OTP step (shown when login returns email_not_verified) ───────

interface LoginOtpStepProps {
  email: string;
  onVerified: () => void | Promise<void>;
  onChangeEmail: () => void;
}

function LoginOtpStep({ email, onVerified, onChangeEmail }: LoginOtpStepProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState(`We sent a 6-digit code to ${email}.`);
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
      await onVerified();
    } catch (err) {
      const e = err as Error;
      setError(e.message ?? 'Verification failed. Please try again.');
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
          Your account isn't verified yet. Enter the 6-digit code we sent to{' '}
          <span className="font-semibold text-[var(--color-ink)]">{email}</span>.
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
          {verifying ? 'Verifying…' : 'Verify & sign in'}
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
          ← Back to sign in
        </button>
      </div>
    </>
  );
}

