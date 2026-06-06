import { getTranslations } from 'next-intl/server';
import { AppSidebar } from '@/components/AppSidebar';
import { AppTopBar } from '@/components/AppTopBar';
import { SolutionsClient } from './SolutionsClient';

export default async function SolutionsPage() {
  const t = await getTranslations('solutions');
  return (
    <main className="min-h-dvh bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
      <div className="flex min-h-dvh">
        <AppSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <AppTopBar
            eyebrow={t('eyebrow')}
            searchPlaceholder={t('searchPlaceholder')}
            title={t('pageTitle')}
          />
          <SolutionsClient />
        </section>
      </div>
    </main>
  );
}
