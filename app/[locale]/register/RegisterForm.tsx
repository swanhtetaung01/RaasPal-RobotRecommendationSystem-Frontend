/**
 * app/[locale]/register/RegisterForm.tsx
 *
 * Client component for the public sign-up form.
 *
 * IMPORTANT — UI-only for now:
 *   `REGISTRATION_ENABLED` is false because the backend has no
 *   `POST /api/v1/auth/register` endpoint yet. While false, a valid submit
 *   shows a friendly "coming soon" notice instead of calling the API.
 *
 *   To go live later:
 *     1. Add `POST /api/v1/auth/register` on the backend (creates a user,
 *        returns the same AuthResponse as /login) and whitelist it in
 *        SecurityConfig (permitAll).
 *     2. Set REGISTRATION_ENABLED = true.
 *   The success path below already auto-logs-in + redirects, mirroring LoginForm.
 */

'use client';

import { useState } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Eye, EyeOff, Info, Loader2 } from 'lucide-react';

/** Flip to true once the backend register endpoint exists and is public. */
const REGISTRATION_ENABLED = false;

const MIN_PASSWORD_LENGTH = 8;

interface RegisterFormProps {
  locale: string;
}

export function RegisterForm({ locale }: RegisterFormProps) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false); // "coming soon" placeholder notice
  const [loading, setLoading] = useState(false);

  /** Returns an error message, or null when the form is valid. */
  function validate(): string | null {
    if (fullName.trim().length < 2) return 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (password !== confirm) return 'Passwords do not match.';
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Backend endpoint not live yet → show the placeholder notice.
    if (!REGISTRATION_ENABLED) {
      setPending(true);
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register({ fullName: fullName.trim(), email, password });
      if (!res.data.success) throw new Error(res.data.message ?? 'Registration failed');

      const { accessToken, user } = res.data.data;
      login(accessToken, user);

      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: accessToken }),
      });

      router.push('/', { locale });
    } catch (err: unknown) {
      const hasResponse = !!(err as { response?: unknown })?.response;
      const message = hasResponse
        ? ((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Could not create your account.')
        : 'Server is unavailable. Please try again in a moment.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // Placeholder confirmation state — replaces the form once submitted while disabled.
  if (pending) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--app-brand-soft)] text-[var(--app-brand-dark)]">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <div>
          <p className="text-base font-semibold text-[var(--app-text)]">Thanks, {fullName.trim().split(' ')[0] || 'there'}!</p>
          <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
            Self-service sign-up isn’t switched on yet. Please ask a RAASPAL
            administrator to create your account, then sign in.
          </p>
        </div>
        <Link
          className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[var(--app-brand)] to-[var(--app-brand-dark)] text-sm font-semibold text-white shadow-lg shadow-[var(--app-brand-glow)] transition hover:brightness-105 active:scale-[0.99]"
          href="/login"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-[var(--app-text)]" htmlFor="fullName">
          Full name
        </Label>
        <Input
          autoComplete="name"
          className="h-11 rounded-xl border-[var(--app-border)] bg-[var(--app-panel-alt)]/80 text-[var(--app-text)] placeholder:text-[var(--app-muted)] transition focus-visible:border-[var(--app-brand)] focus-visible:ring-[var(--app-brand)]"
          disabled={loading}
          id="fullName"
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Specialist"
          required
          type="text"
          value={fullName}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-[var(--app-text)]" htmlFor="email">
          Email
        </Label>
        <Input
          autoComplete="email"
          className="h-11 rounded-xl border-[var(--app-border)] bg-[var(--app-panel-alt)]/80 text-[var(--app-text)] placeholder:text-[var(--app-muted)] transition focus-visible:border-[var(--app-brand)] focus-visible:ring-[var(--app-brand)]"
          disabled={loading}
          id="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="specialist@raaspal.com"
          required
          type="email"
          value={email}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-[var(--app-text)]" htmlFor="password">
          Password
        </Label>
        <div className="relative">
          <Input
            autoComplete="new-password"
            className="h-11 rounded-xl border-[var(--app-border)] bg-[var(--app-panel-alt)]/80 pr-10 text-[var(--app-text)] placeholder:text-[var(--app-muted)] transition focus-visible:border-[var(--app-brand)] focus-visible:ring-[var(--app-brand)]"
            disabled={loading}
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            type={showPassword ? 'text' : 'password'}
            value={password}
          />
          <button
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--app-muted)] hover:text-[var(--app-text)]"
            onClick={() => setShowPassword((v) => !v)}
            type="button"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-[var(--app-text)]" htmlFor="confirm">
          Confirm password
        </Label>
        <Input
          autoComplete="new-password"
          className="h-11 rounded-xl border-[var(--app-border)] bg-[var(--app-panel-alt)]/80 text-[var(--app-text)] placeholder:text-[var(--app-muted)] transition focus-visible:border-[var(--app-brand)] focus-visible:ring-[var(--app-brand)]"
          disabled={loading}
          id="confirm"
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter your password"
          required
          type={showPassword ? 'text' : 'password'}
          value={confirm}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {!REGISTRATION_ENABLED && (
        <div className="flex items-start gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-brand-soft)]/50 px-4 py-3 text-xs leading-5 text-[var(--app-muted)]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--app-brand-dark)]" />
          <span>Self-service sign-up is launching soon. You can fill this in to preview the flow.</span>
        </div>
      )}

      <Button
        className="h-11 w-full rounded-xl bg-gradient-to-r from-[var(--app-brand)] to-[var(--app-brand-dark)] font-semibold text-white shadow-lg shadow-[var(--app-brand-glow)] transition hover:shadow-xl hover:shadow-[var(--app-brand-glow)] hover:brightness-105 focus-visible:ring-[var(--app-brand)] active:scale-[0.99]"
        disabled={loading}
        type="submit"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account…
          </>
        ) : (
          'Create account'
        )}
      </Button>
    </form>
  );
}
