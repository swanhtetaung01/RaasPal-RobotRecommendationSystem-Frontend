import { LayoutDashboard } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import { AppTopBar } from '@/components/AppTopBar';

export default function LocaleHomePage() {
  return (
    <main className="min-h-dvh bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
      <div className="flex min-h-dvh">
        <AppSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <AppTopBar
            eyebrow="Overview"
            searchPlaceholder="Search…"
            title="Team Dashboard"
          />

          <div className="flex flex-1 items-center justify-center p-8">
            <div className="text-center">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--app-hero)] text-[var(--app-brand)]">
                <LayoutDashboard className="h-7 w-7" />
              </span>
              <h2 className="text-xl font-semibold text-[var(--app-text)]">Dashboard coming soon</h2>
              <p className="mt-2 text-sm text-[var(--app-muted)]">
                Analytics and team insights will appear here.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
