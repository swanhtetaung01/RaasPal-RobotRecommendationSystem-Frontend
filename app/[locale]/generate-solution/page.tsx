import {
  ArrowRight,
  Factory,
  PackageCheck,
  Sparkles,
  SprayCan,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { AppSidebar } from '@/components/AppSidebar';
import { AppTopBar } from '@/components/AppTopBar';

const solutionTypes = [
  {
    key: 'cleaning',
    href: '/generate-solution/cleaning',
    icon: SprayCan,
  },
  {
    key: 'delivery',
    href: '/generate-solution/delivery',
    icon: PackageCheck,
  },
  {
    key: 'concierge',
    href: '/generate-solution/concierge',
    icon: Factory,
  },
];

export default async function GenerateSolutionPage() {
  const t = await getTranslations('generateSolution');

  return (
    <main className="min-h-dvh bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
      <div className="flex min-h-dvh">
        <AppSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <AppTopBar
            eyebrow={t('eyebrow')}
            searchPlaceholder={t('searchPlaceholder')}
            title={t('title')}
          />

          <div className="space-y-6 p-4 sm:p-6">
            <section className="bg-aurora animate-aurora relative overflow-hidden rounded-3xl p-6 text-white shadow-xl shadow-[var(--app-brand-glow)] sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.16),transparent_55%)]" />
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-300/30 blur-3xl animate-float-orb" />
              <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-cyan-100">{t('hub.kicker')}</p>
                  <h2 className="mt-3 max-w-3xl text-3xl font-bold">{t('hub.title')}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">{t('hub.description')}</p>
                </div>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-cyan-100 ring-1 ring-white/20 backdrop-blur-sm">
                  <Sparkles className="h-7 w-7" />
                </span>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-3">
              {solutionTypes.map((solution) => (
                <Link
                  key={solution.key}
                  className="group flex min-h-72 flex-col rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--app-brand)] hover:shadow-lg hover:shadow-[var(--app-brand-glow)]"
                  href={solution.href}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--app-brand-soft)] text-[var(--app-brand-dark)]">
                      <solution.icon className="h-7 w-7" />
                    </span>
                    <ArrowRight className="h-5 w-5 text-[var(--app-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--app-brand-dark)]" />
                  </div>

                  <div className="mt-8">
                    <p className="text-sm font-semibold uppercase text-[var(--app-muted)]">
                      {t(`hub.choices.${solution.key}.kicker`)}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold">{t(`hub.choices.${solution.key}.title`)}</h3>
                    <p className="mt-3 text-sm leading-6 text-[var(--app-muted)]">
                      {t(`hub.choices.${solution.key}.description`)}
                    </p>
                  </div>

                  <span className="mt-auto pt-8 text-sm font-bold text-[var(--app-brand-dark)]">
                    {t('hub.openForm')}
                  </span>
                </Link>
              ))}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
