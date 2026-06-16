/**
 * app/[locale]/register/page.tsx
 *
 * Public self-service sign-up page (UI only for now).
 *
 * STATUS: The backend has no `POST /api/v1/auth/register` endpoint yet, so the
 * form is gated behind RegisterForm's REGISTRATION_ENABLED flag and shows a
 * "coming soon" placeholder on submit. Flip that flag (and ship the endpoint +
 * SecurityConfig whitelist) to make it functional. This route is whitelisted in
 * proxy.ts PUBLIC_PATHS so it is reachable without a JWT.
 *
 * Visual: mirrors the login page's "Bold & Premium" split-screen — a vibrant
 * teal→blue gradient brand panel beside a frosted-glass sign-up card.
 */

import Image from 'next/image';
import { CheckCircle2, Sparkles, UserPlus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { RegisterForm } from './RegisterForm';
import { setRequestLocale } from 'next-intl/server';

const perks = [
  'Turn customer surveys into ranked robot options in minutes',
  'Generate polished, on-brand proposals with one click',
  'One shared workspace for your whole RAASPAL team',
];

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[var(--app-bg)]">
      {/* Soft gradient backdrop + glow orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-[var(--app-brand)]/20 blur-3xl animate-float-orb" />
        <div className="absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-sky-500/20 blur-3xl animate-float-orb-alt" />
      </div>

      <div className="relative grid min-h-dvh lg:grid-cols-2">
        {/* ─── Brand showcase panel (left) ─────────────────────────────────── */}
        <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          <div className="animate-aurora absolute inset-0 bg-gradient-to-br from-[#0a4d6b] via-[var(--app-brand-dark)] to-[#1b4ed8]" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.18),transparent_50%)]" />
          <div className="pointer-events-none absolute -right-16 top-12 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl animate-float-orb" />
          <div className="pointer-events-none absolute -left-10 bottom-10 h-64 w-64 rounded-full bg-indigo-400/25 blur-3xl animate-float-orb-alt" />

          {/* Brand lockup */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
              <Image
                alt="RAAS PAL logo"
                className="h-9 w-9 object-contain"
                height={36}
                priority
                src="/raas-pal-logo.png"
                width={36}
              />
            </div>
            <div className="text-white">
              <p className="text-lg font-bold tracking-tight">RAAS PAL</p>
              <p className="text-xs font-medium text-white/70">Team Operations</p>
            </div>
          </div>

          {/* Headline + perks */}
          <div className="relative z-10 max-w-md">
            <h2 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
              Join the RAASPAL workspace.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Create your account to start matching robots and generating proposals
              with your team.
            </p>

            <ul className="mt-8 space-y-3">
              {perks.map((perk) => (
                <li key={perk} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" />
                  <span className="text-sm leading-6 text-white/80">{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 text-xs text-white/50">
            © {new Date().getFullYear()} RAAS PAL · Internal team portal
          </p>
        </aside>

        {/* ─── Sign-up panel (right) ───────────────────────────────────────── */}
        <section className="flex items-center justify-center px-4 py-12 sm:px-8">
          <div className="w-full max-w-md">
            {/* Compact brand header — only where the panel is hidden */}
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--app-brand)] to-[var(--app-brand-dark)] shadow-lg shadow-[var(--app-brand-glow)]">
                <Image
                  alt="RAAS PAL logo"
                  className="h-10 w-10 object-contain"
                  height={40}
                  priority
                  src="/raas-pal-logo.png"
                  width={40}
                />
              </div>
              <h1 className="text-2xl font-bold text-[var(--app-text)]">RAAS PAL</h1>
              <p className="mt-1 text-sm text-[var(--app-muted)]">
                AI-powered robot recommendation platform
              </p>
            </div>

            {/* Glass sign-up card */}
            <div className="rounded-3xl border border-white/40 bg-[var(--app-panel)]/70 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-white/10 sm:p-10">
              <div className="mb-7">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--app-brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--app-brand-dark)]">
                  <UserPlus className="h-3.5 w-3.5" />
                  Create account
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-[var(--app-text)]">
                  Get started
                </h2>
                <p className="mt-1 text-sm text-[var(--app-muted)]">
                  Set up your RAASPAL team account in a few seconds.
                </p>
              </div>

              <RegisterForm locale={locale} />

              <p className="mt-6 text-center text-sm text-[var(--app-muted)]">
                Already have an account?{' '}
                <Link
                  className="font-semibold text-[var(--app-brand-dark)] hover:underline"
                  href="/login"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-[var(--app-muted)]">
              <Sparkles className="h-3.5 w-3.5" />
              RAASPAL · Internal team portal
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
