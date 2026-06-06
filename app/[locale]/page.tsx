import { getTranslations } from 'next-intl/server';
import { Bot, ChevronRight, ClipboardList, FileText, Sparkles, Zap } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import { AppTopBar } from '@/components/AppTopBar';
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

            {/* Hero CTA */}
            <div className="relative overflow-hidden rounded-2xl bg-[var(--app-hero)] p-8 text-white shadow-lg">
              <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-cyan-300" />
                    <span className="text-sm font-semibold uppercase tracking-wider text-cyan-200">
                      {t('hero.eyebrow')}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold leading-tight">{t('hero.title')}</h2>
                  <p className="max-w-md text-sm leading-6 text-white/70">{t('hero.description')}</p>
                </div>

                <Link
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[var(--app-hero)] shadow transition hover:bg-cyan-50 active:scale-95"
                  href="/generate-solution"
                >
                  <Zap className="h-4 w-4" />
                  {t('hero.cta')}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* decorative blobs */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
              <div className="pointer-events-none absolute -bottom-8 right-24 h-32 w-32 rounded-full bg-white/5" />
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
                    className="rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-4"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--app-brand-soft)] text-sm font-bold text-[var(--app-brand-dark)]">
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
                    className="flex items-center gap-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--app-brand)] hover:shadow-md hover:shadow-[var(--app-brand-glow)]"
                    href={href}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-brand-soft)] text-[var(--app-brand-dark)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--app-text)]">{label}</p>
                      <p className="text-xs text-[var(--app-muted)]">{description}</p>
                    </div>
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-[var(--app-muted)]" />
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
