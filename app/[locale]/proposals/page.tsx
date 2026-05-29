import { AppSidebar } from '@/components/AppSidebar';
import { AppTopBar } from '@/components/AppTopBar';
import { ProposalsClient } from './ProposalsClient';

export default function ProposalsPage() {
  return (
    <main className="min-h-dvh bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
      <div className="flex min-h-dvh">
        <AppSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <AppTopBar
            eyebrow="History"
            searchPlaceholder="Search proposals…"
            title="Proposals"
          />
          <ProposalsClient />
        </section>
      </div>
    </main>
  );
}
