import { AppSidebar } from '@/components/AppSidebar';
import { AppTopBar } from '@/components/AppTopBar';
import { EditRobotClient } from './EditRobotClient';

export default function EditRobotPage() {
  return (
    <main className="min-h-dvh bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
      <div className="flex min-h-dvh">
        <AppSidebar />
        <section className="flex min-w-0 flex-1 flex-col">
          <AppTopBar eyebrow="Catalog" title="Edit Robot" />
          <EditRobotClient />
        </section>
      </div>
    </main>
  );
}
