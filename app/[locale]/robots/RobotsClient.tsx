'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bot, Loader2 } from 'lucide-react';
import { robotApi } from '@/lib/api';
import type { RobotResponse, RobotType } from '@/types/api';

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
    VERIFIED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    PENDING:  'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    REJECTED: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${styles[status]}`}>
      {status}
    </span>
  );
}

function PriceBadge({ band }: { band: RobotResponse['priceBand'] }) {
  const labels: Record<RobotResponse['priceBand'], string> = {
    LOW: '$', MEDIUM: '$$', HIGH: '$$$', PREMIUM: '$$$$',
  };
  return (
    <span className="rounded-full bg-[var(--app-faint)] px-2.5 py-0.5 text-xs font-bold text-[var(--app-muted)]">
      {labels[band]}
    </span>
  );
}

/* ─── Robot card ──────────────────────────────────────────────────────────── */

function RobotCard({ robot }: { robot: RobotResponse }) {
  const s = robot.spec;

  const specs = [
    s?.speedMs != null          && { label: 'Speed',    value: `${s.speedMs} m/s` },
    s?.widthCleaningMm != null  && { label: 'Clean width', value: `${s.widthCleaningMm} mm` },
    s?.batteryWorkTimeSweepHr != null && { label: 'Battery', value: `${s.batteryWorkTimeSweepHr} hr` },
    s?.noiseLevelDb != null     && { label: 'Noise',    value: `${s.noiseLevelDb} dB` },
    s?.robotWeightKg != null    && { label: 'Weight',   value: `${s.robotWeightKg} kg` },
    s?.minimumPassableWidthMm != null && { label: 'Min aisle', value: `${s.minimumPassableWidthMm} mm` },
  ].filter(Boolean) as { label: string; value: string }[];

  const navTags = [
    s?.navigationLidar2d  && 'LiDAR 2D',
    s?.navigationLidar3d  && 'LiDAR 3D',
    s?.navigationCameraVslam && 'vSLAM',
  ].filter(Boolean) as string[];

  return (
    <article className="flex flex-col rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--app-brand)] hover:shadow-md hover:shadow-[var(--app-brand-glow)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-brand-soft)] text-[var(--app-brand-dark)]">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold text-[var(--app-text)]">{robot.brand}</p>
            <p className="text-sm text-[var(--app-muted)]">{robot.model}</p>
          </div>
        </div>
        <StatusBadge status={robot.testStatus} />
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-2">
        <TypeBadge type={robot.robotType} />
        <PriceBadge band={robot.priceBand} />
        {navTags.map((tag) => (
          <span key={tag} className="rounded-full bg-[var(--app-faint)] px-2.5 py-0.5 text-xs font-semibold text-[var(--app-muted)]">
            {tag}
          </span>
        ))}
      </div>

      {/* Key specs */}
      {specs.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[var(--app-border)] pt-4">
          {specs.map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-[var(--app-muted)]">{label}</p>
              <p className="text-sm font-semibold text-[var(--app-text)]">{value}</p>
            </div>
          ))}
        </div>
      )}
    </article>
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

  const { data, isLoading, isError } = useQuery({
    queryKey: ['robots'],
    queryFn: () => robotApi.getAll(0, 100).then((r) => r.data.data),
  });

  const all = data?.content ?? [];
  const filtered = activeType === 'ALL' ? all : all.filter((r) => r.robotType === activeType);

  return (
    <div className="space-y-5 p-4 sm:p-6">

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {TYPES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveType(key)}
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
        <p className="text-sm text-[var(--app-muted)]">
          {isLoading ? 'Loading…' : `${filtered.length} robot${filtered.length === 1 ? '' : 's'}`}
        </p>
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

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((robot) => (
            <RobotCard key={robot.id} robot={robot} />
          ))}
        </div>
      )}
    </div>
  );
}
