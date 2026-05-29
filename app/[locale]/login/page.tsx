/**
 * app/[locale]/login/page.tsx
 *
 * Login page — the only public route in the app.
 * On success:
 *   1. Stores JWT in Zustand + localStorage (client-side navigation)
 *   2. Sets `raaspal_token` httpOnly cookie via /api/auth/session (edge guard)
 *   3. Redirects to the dashboard
 */

import Image from 'next/image';
import { LoginForm } from './LoginForm';
import { setRequestLocale } from 'next-intl/server';

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--app-bg)] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <Image
            alt="RAAS PAL logo"
            className="mx-auto mb-4 h-16 w-16 drop-shadow-lg"
            height={64}
            priority
            src="/raas-pal-logo.png"
            width={64}
          />
          <h1 className="text-2xl font-bold text-[var(--app-text)]">RAAS PAL</h1>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            AI-powered robot recommendation platform
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-panel)] p-8 shadow-xl shadow-slate-900/10">
          <h2 className="mb-1 text-xl font-semibold text-[var(--app-text)]">Sign in</h2>
          <p className="mb-6 text-sm text-[var(--app-muted)]">
            Enter your team credentials to continue.
          </p>
          <LoginForm locale={locale} />
        </div>

        <p className="mt-6 text-center text-xs text-[var(--app-muted)]">
          RAAS PAL · Internal team portal
        </p>
      </div>
    </main>
  );
}
