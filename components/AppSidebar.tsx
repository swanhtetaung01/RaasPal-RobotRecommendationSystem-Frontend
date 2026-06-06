'use client';

import {
  Bot,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useAuthStore } from '@/store/auth';

export const navigationItems = [
  { title: 'Team Dashboard', labelKey: 'teamDashboard', href: '/', icon: LayoutDashboard },
  { title: 'Generate Solution', labelKey: 'generateSolution', href: '/generate-solution', icon: ClipboardList },
  { title: 'Solutions', labelKey: 'solutions', href: '/solutions', icon: Sparkles },
  { title: 'Proposals', labelKey: 'proposals', href: '/proposals', icon: FileText },
  { title: 'Robots', labelKey: 'robots', href: '/robots', icon: Bot },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('nav');
  const sidebarT = useTranslations('sidebar');
  const user = useAuthStore((s) => s.user);

  return (
    <aside
      className={`hidden shrink-0 border-r border-[var(--app-border)] bg-[var(--app-panel-soft)] px-4 py-5 transition-[width] duration-200 min-[1680px]:flex min-[1680px]:flex-col ${
        collapsed ? 'w-24' : 'w-72'
      }`}
    >
      <div className={`mb-8 flex items-center gap-3 px-2 ${collapsed ? 'justify-center' : ''}`}>
        <Image
          alt="RAAS PAL logo"
          className={`${collapsed ? 'h-12 w-12' : 'h-14 w-14'} rounded-2xl object-contain transition-[height,width] dark:shadow-lg dark:shadow-[var(--app-brand-glow)]`}
          height={56}
          priority
          src="/raas-pal-logo.png"
          width={56}
        />
        {!collapsed && (
          <div>
            <p className="text-base font-semibold">RAAS PAL</p>
            <p className="text-xs font-medium text-[var(--app-muted)]">{sidebarT('teamOperations')}</p>
          </div>
        )}
      </div>

      <div className={`mb-3 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-3'}`}>
        {!collapsed && (
          <p className="text-xs font-semibold uppercase text-[var(--app-muted)]">{sidebarT('teamWorkspace')}</p>
        )}
        <button
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-panel)] text-[var(--app-muted)] transition hover:border-[var(--app-brand)] hover:text-[var(--app-brand-dark)]"
          onClick={() => setCollapsed((value) => !value)}
          type="button"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="space-y-1">
        {navigationItems.map((item) => {
          const active = item.href === '/' ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
          <Link
            key={item.labelKey}
            aria-label={t(item.labelKey)}
            title={collapsed ? t(item.labelKey) : undefined}
            className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
              collapsed ? 'justify-center' : ''
            } ${
              active
                ? 'border border-[var(--app-brand)] bg-[var(--app-panel)] text-[var(--app-brand-dark)] shadow-sm'
                : 'text-[var(--app-muted)] hover:bg-[var(--app-panel)] hover:text-[var(--app-brand-dark)]'
            }`}
            href={item.href}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{t(item.labelKey)}</span>}
          </Link>
        )})}
      </nav>

      <div className={`mt-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)]/80 p-4 ${collapsed ? 'px-2' : ''}`}>
        {!collapsed && <p className="text-xs font-semibold uppercase text-[var(--app-muted)]">{sidebarT('signedInAs')}</p>}
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'mt-3'}`}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--app-hero)] text-sm font-bold text-white">
            {user?.fullName?.slice(0, 2).toUpperCase() ?? 'RE'}
          </span>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold">{user?.fullName ?? 'Raas Pal Specialist'}</p>
              <p className="text-xs text-[var(--app-muted)]">{user?.role ?? 'RAASPAL_TEAM'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
