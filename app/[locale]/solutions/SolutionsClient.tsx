'use client';

import { useQuery } from '@tanstack/react-query';
import { Bot, ChevronRight, ClipboardList, Loader2, Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { recommendationApi } from '@/lib/api';
import type { RecommendationResponse } from '@/types/api';

function StatusBadge({ status }: { status: RecommendationResponse['status'] }) {
  const styles: Record<RecommendationResponse['status'], string> = {
    COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    PENDING:   'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    FAILED:    'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400',
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}>
      {status}
    </span>
  );
}

function RecommendationCard({ rec }: { rec: RecommendationResponse }) {
  const date = new Date(rec.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const topOption = rec.options?.[0];
  const robotName = topOption
    ? `${topOption.robot.brand} ${topOption.robot.model}`
    : rec.status === 'COMPLETED'
      ? 'Robot recommendation'
      : 'Processing…';
  const optionCount = rec.options?.length ?? 0;

  const solutionType = topOption?.robot.robotType?.toLowerCase() ?? 'cleaning';
  const viewHref = `/generate-solution/${solutionType}/recommendation?recId=${rec.id}`;

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--app-brand)] hover:shadow-md hover:shadow-[var(--app-brand-glow)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--app-brand-soft)] text-[var(--app-brand-dark)]">
          <Bot className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-[var(--app-text)]">{robotName}</p>
          <p className="mt-0.5 text-xs text-[var(--app-muted)]">
            {optionCount > 0 ? `${optionCount} option${optionCount === 1 ? '' : 's'} · ` : ''}
            {date}
          </p>
          {topOption?.fitLevel && (
            <p className="mt-1 text-xs font-medium text-[var(--app-brand-dark)]">
              Fit: {topOption.fitLevel}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pl-[60px] sm:pl-0">
        <StatusBadge status={rec.status} />
        {rec.status === 'COMPLETED' && (
          <Link
            className="flex items-center gap-1 rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-sm font-semibold text-[var(--app-muted)] transition hover:border-[var(--app-brand)] hover:text-[var(--app-brand-dark)]"
            href={viewHref}
          >
            View
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-panel)] py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--app-hero)] text-[var(--app-brand)]">
        <ClipboardList className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-[var(--app-text)]">No recommendations yet</h3>
      <p className="mt-1 max-w-xs text-sm text-[var(--app-muted)]">
        Upload a customer survey to generate your first robot recommendation.
      </p>
      <Link
        className="mt-6 flex items-center gap-2 rounded-lg bg-[var(--app-brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--app-brand-dark)]"
        href="/generate-solution"
      >
        <Plus className="h-4 w-4" />
        Generate solution
      </Link>
    </div>
  );
}

export function SolutionsClient() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => recommendationApi.getAll(0, 50).then((r) => r.data.data),
  });

  const recommendations = data?.content ?? [];

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--app-muted)]">
          {isLoading
            ? 'Loading…'
            : `${data?.totalElements ?? 0} recommendation${(data?.totalElements ?? 0) === 1 ? '' : 's'}`}
        </p>
        <Link
          className="flex items-center gap-2 rounded-lg bg-[var(--app-brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--app-brand-dark)]"
          href="/generate-solution"
        >
          <Plus className="h-4 w-4" />
          New solution
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-[var(--app-brand)]" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          Failed to load solutions. Please refresh the page.
        </div>
      )}

      {!isLoading && !isError && recommendations.length === 0 && <EmptyState />}

      {recommendations.length > 0 && (
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </div>
      )}
    </div>
  );
}
