'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bot, ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { robotApi } from '@/lib/api';
import { RobotDetailModal } from '@/components/RobotDetailModal';
import type { RobotResponse, RobotType } from '@/types/api';

const ITEMS_PER_PAGE = 9;

/* ─── Badges ──────────────────────────────────────────────────────────────── */

function TypeBadge({ type }: { type: RobotType }) {
  const styles: Record<RobotType, string> = {
    CLEANING:  'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
    DELIVERY:  'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
    CONCIERGE: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${styles[type]}`}>
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: RobotResponse['testStatus'] }) {
  const styles: Record<RobotResponse['testStatus'], string> = {
    VERIFIED:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    PENDING:      'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    UNDER_TESTING:'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
    REJECTED:     'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400',
    DRAFT:        'bg-gray-100 text-gray-500 dark:bg-gray-900/40 dark:text-gray-400',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${styles[status]}`}>
      {status}
    </span>
  );
}

function PriceBadge({ robot }: { robot: RobotResponse }) {
  const bandLabels: Partial<Record<RobotResponse['priceBand'], string>> = {
    LOW: '$', MEDIUM: '$$', MODERATE: '$$', HIGH: '$$$', PREMIUM: '$$$$',
  };
  const fmt = (n: number) => '฿' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (robot.rentalPrice != null || robot.sellingPrice != null) {
    return (
      <span className="rounded-full bg-[var(--app-faint)] px-2.5 py-0.5 text-xs font-bold text-[var(--app-muted)]">
        {robot.rentalPrice != null && `${fmt(robot.rentalPrice)}/mo`}
        {robot.rentalPrice != null && robot.sellingPrice != null && ' · '}
        {robot.sellingPrice != null && fmt(robot.sellingPrice)}
      </span>
    );
  }
  if (robot.priceBand) {
    return (
      <span className="rounded-full bg-[var(--app-faint)] px-2.5 py-0.5 text-xs font-bold text-[var(--app-muted)]">
        {bandLabels[robot.priceBand] ?? robot.priceBand}
      </span>
    );
  }
  return null;
}

/* ─── Robot row ───────────────────────────────────────────────────────────── */

function RobotRow({ robot, onClick }: { robot: RobotResponse; onClick: () => void }) {
  const s = robot.spec;
  const specs = [
    s?.speedMs != null             && `${s.speedMs} m/s`,
    s?.batteryWorkTimeSweepHr != null && `${s.batteryWorkTimeSweepHr} hr`,
    s?.widthCleaningMm != null     && `${s.widthCleaningMm} mm`,
  ].filter(Boolean) as string[];

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--app-faint)]"
    >
      {robot.imageUrl ? (
        <img
          src={robot.imageUrl}
          alt={robot.model}
          className="h-9 w-9 shrink-0 rounded-lg object-contain bg-[var(--app-faint)]"
        />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--app-brand-soft)] text-[var(--app-brand-dark)]">
          <Bot className="h-4 w-4" />
        </span>
      )}

      <p className="w-44 shrink-0 truncate text-sm font-semibold text-[var(--app-text)]">{robot.model}</p>

      <div className="flex flex-1 flex-wrap items-center gap-1.5 min-w-0">
        <TypeBadge type={robot.robotType} />
        <StatusBadge status={robot.testStatus} />
        <PriceBadge robot={robot} />
      </div>

      {specs.length > 0 && (
        <div className="hidden lg:flex items-center gap-4 shrink-0 text-xs text-[var(--app-muted)]">
          {specs.map((v) => <span key={v}>{v}</span>)}
        </div>
      )}

      <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-[var(--app-muted)] opacity-40" />
    </div>
  );
}

/* ─── Pagination ──────────────────────────────────────────────────────────── */

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (currentPage <= 4) {
    pages.push(1, 2, 3, 4, 5, '…', totalPages);
  } else if (currentPage >= totalPages - 3) {
    pages.push(1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push(1, '…', currentPage - 1, currentPage, currentPage + 1, '…', totalPages);
  }

  const btn = 'inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition';

  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btn} border border-[var(--app-border)] text-[var(--app-muted)] hover:border-[var(--app-brand)] hover:text-[var(--app-brand-dark)] disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-[var(--app-muted)]">…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p as number)}
            className={`${btn} ${
              p === currentPage
                ? 'bg-[var(--app-brand)] text-white'
                : 'border border-[var(--app-border)] text-[var(--app-muted)] hover:border-[var(--app-brand)] hover:text-[var(--app-brand-dark)]'
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btn} border border-[var(--app-border)] text-[var(--app-muted)] hover:border-[var(--app-brand)] hover:text-[var(--app-brand-dark)] disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ─── Filter tabs ─────────────────────────────────────────────────────────── */

const TYPES: Array<{ key: RobotType | 'ALL'; label: string }> = [
  { key: 'ALL',       label: 'All' },
  { key: 'CLEANING',  label: 'Cleaning' },
  { key: 'DELIVERY',  label: 'Delivery' },
  { key: 'CONCIERGE', label: 'Concierge' },
];

/* ─── Main ────────────────────────────────────────────────────────────────── */

export function RobotsClient() {
  const [activeType, setActiveType] = useState<RobotType | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRobot, setSelectedRobot] = useState<RobotResponse | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['robots'],
    queryFn: () => robotApi.getAll(0, 200).then((r) => r.data.data),
  });

  const all = [...(data?.content ?? [])].sort((a, b) => {
    const brandCmp = a.brand.localeCompare(b.brand);
    return brandCmp !== 0 ? brandCmp : a.model.localeCompare(b.model);
  });

  const filtered = activeType === 'ALL' ? all : all.filter((r) => r.robotType === activeType);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  function handleTypeChange(type: RobotType | 'ALL') {
    setActiveType(type);
    setCurrentPage(1);
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">

      {/* Filter tabs + Add button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {TYPES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTypeChange(key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                activeType === key
                  ? 'bg-[var(--app-brand)] text-white'
                  : 'border border-[var(--app-border)] text-[var(--app-muted)] hover:border-[var(--app-brand)] hover:text-[var(--app-brand-dark)]'
              }`}
            >
              {label}
              {!isLoading && (
                <span className="ml-1.5 opacity-70">
                  {key === 'ALL' ? all.length : all.filter((r) => r.robotType === key).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && filtered.length > 0 && (
            <p className="text-sm text-[var(--app-muted)]">
              {pageStart + 1}–{Math.min(pageStart + ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </p>
          )}
          <Link
            href="/robots/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--app-brand)] px-3 py-1.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Robot
          </Link>
        </div>
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-[var(--app-brand)]" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          Failed to load robots. Please refresh the page.
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-panel)] py-16 text-center">
          <Bot className="mx-auto h-8 w-8 text-[var(--app-muted)]" />
          <p className="mt-3 text-sm text-[var(--app-muted)]">No robots in this category yet.</p>
        </div>
      )}

      {/* Brand groups */}
      {paginated.length > 0 && (() => {
        const groups = paginated.reduce<Record<string, RobotResponse[]>>((acc, robot) => {
          (acc[robot.brand] ??= []).push(robot);
          return acc;
        }, {});
        return (
          <div className="space-y-5">
            {Object.entries(groups).map(([brand, robots]) => (
              <div key={brand} className="space-y-2">
                <div className="flex items-center gap-3 px-1">
                  <span className="shrink-0 text-xs font-bold uppercase tracking-widest text-[var(--app-muted)]">
                    {brand}
                  </span>
                  <div className="flex-1 border-t border-[var(--app-border)]" />
                  <span className="shrink-0 text-xs text-[var(--app-muted)] opacity-60">
                    {robots.length} {robots.length === 1 ? 'model' : 'models'}
                  </span>
                </div>
                <div className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] divide-y divide-[var(--app-border)]">
                  {robots.map((robot) => (
                    <RobotRow key={robot.id} robot={robot} onClick={() => setSelectedRobot(robot)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Detail modal */}
      {selectedRobot && (
        <RobotDetailModal robot={selectedRobot} onClose={() => setSelectedRobot(null)} />
      )}
    </div>
  );
}
