import { Bell, Search } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TopNavigationMenu } from '@/components/TopNavigationMenu';
import { UserMenu } from '@/components/UserMenu';

type AppTopBarProps = {
  eyebrow: string;
  title: string;
  searchPlaceholder?: string;
};

export function AppTopBar({ eyebrow, title, searchPlaceholder = '' }: AppTopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--app-border)] bg-[var(--app-panel)]/85 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-[var(--app-muted)]">{eyebrow}</p>
          <h1 className="truncate text-lg font-semibold sm:text-xl">{title}</h1>
        </div>

        <div className="ml-auto hidden h-10 min-w-0 max-w-xl flex-1 items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-panel-alt)] px-3 text-sm text-[var(--app-muted)] min-[1200px]:flex">
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">{searchPlaceholder}</span>
        </div>

        <button
          aria-label="Notifications"
          className="hidden h-10 w-10 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-muted)] sm:flex"
          type="button"
        >
          <Bell className="h-4 w-4" />
        </button>
        <ThemeToggle />
        <LanguageSwitcher />
        <UserMenu />
        <TopNavigationMenu />
      </div>
    </header>
  );
}
