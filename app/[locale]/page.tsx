import { getTranslations } from 'next-intl/server';
import { Bot, ChevronRight, ClipboardList, FileText, Sparkles, Zap } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import { AppTopBar } from '@/components/AppTopBar';
import { CvteStatusSummary } from '@/components/CvteStatusSummary';
import { Link } from '@/i18n/navigation';

export default async function LocaleHomePage() {
  const t = await getTranslations('teamDashboard');

  const steps = [
    { number: '1', title: t('howItWorks.step1Title'), description: t('howItWorks.step1Description') },
    { number: '2', title: t('howItWorks.step2Title'), description: t('howItWorks.step2Description') },
    { number: '3', title: t('howItWorks.step3Title'), description: t('howItWorks.step3Description') },
    { number: '4', title: t('howItWorks.step4Title'), description: t('howItWorks.step4Description') },
  ];

  const quickLinks = [
    { href: '/solutions', icon: ClipboardList, label: t('quickAccess.solutionsLabel'), description: t('quickAccess.solutionsDesc') },
    { href: '/proposals', icon: FileText,     label: t('quickAccess.proposalsLabel'), description: t('quickAccess.proposalsDesc') },
    { href: '/robots',    icon: Bot,          label: t('quickAccess.robotsLabel'),    description: t('quickAccess.robotsDesc') },
  ];

  return (
    <main className="min-h-dvh bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
      <div className="flex min-h-dvh">
        <AppSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <AppTopBar
            eyebrow={t('eyebrow')}
            searchPlaceholder="Search…"
            title={t('title')}
          />

          <div className="mx-auto w-full max-w-4xl space-y-8 p-6">

            {/* CVTE C3 status preview */}
            <CvteStatusSummary />

            {/* Hero CTA — Bold & Premium showcase surface */}
            <div className="relative overflow-hidden rounded-3xl p-8 text-white shadow-xl shadow-[var(--app-brand-glow)] sm:p-10">
              {/* animated aurora gradient + light sweep */}
              <div className="animate-aurora absolute inset-0 bg-gradient-to-br from-[#0a4d6b] via-[var(--app-brand-dark)] to-[#1b4ed8]" />
              <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.18),transparent_55%)]" />

              {/* glow orbs */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-300/30 blur-3xl animate-float-orb" />
              <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-indigo-400/25 blur-3xl animate-float-orb-alt" />

              <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20 backdrop-blur-sm">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-cyan-100">
                      {t('hero.eyebrow')}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold leading-tight xl:text-3xl">{t('hero.title')}</h2>
                  <p className="max-w-md text-sm leading-6 text-white/75">{t('hero.description')}</p>
                </div>

                <Link
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[var(--app-brand-dark)] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95"
                  href="/generate-solution"
                >
                  <Zap className="h-4 w-4" />
                  {t('hero.cta')}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* How it works */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                {t('howItWorks.heading')}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className="group rounded-2xl border border-[var(--app-border)] bg-[var(--app-panel)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--app-brand)] hover:shadow-md hover:shadow-[var(--app-brand-glow)]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--app-brand)] to-[var(--app-brand-dark)] text-sm font-bold text-white shadow-sm shadow-[var(--app-brand-glow)]">
                      {step.number}
                    </span>
                    <p className="mt-3 text-sm font-semibold text-[var(--app-text)]">{step.title}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--app-muted)]">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                {t('quickAccess.heading')}
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {quickLinks.map(({ href, icon: Icon, label, description }) => (
                  <Link
                    key={href}
                    className="group flex items-center gap-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-panel)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--app-brand)] hover:shadow-md hover:shadow-[var(--app-brand-glow)]"
                    href={href}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--app-brand-soft)] text-[var(--app-brand-dark)] transition group-hover:bg-gradient-to-br group-hover:from-[var(--app-brand)] group-hover:to-[var(--app-brand-dark)] group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--app-text)]">{label}</p>
                      <p className="text-xs text-[var(--app-muted)]">{description}</p>
                    </div>
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-[var(--app-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--app-brand)]" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
