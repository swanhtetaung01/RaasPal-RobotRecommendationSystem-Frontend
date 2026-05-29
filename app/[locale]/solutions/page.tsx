import { AppSidebar } from '@/components/AppSidebar';
import { AppTopBar } from '@/components/AppTopBar';
import { SolutionsClient } from './SolutionsClient';

export default function SolutionsPage() {
  return (
    <main className="min-h-dvh bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
      <div className="flex min-h-dvh">
        <AppSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <AppTopBar
            eyebrow="History"
            searchPlaceholder="Search solutions…"
            title="Solutions"
          />
          <SolutionsClient />
        </section>
      </div>
    </main>
  );
}
