'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Bot, ClipboardList, FileText, Loader2, Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { proposalApi } from '@/lib/api';
import type { GeneratedProposalResponse } from '@/types/api';

function StatusBadge({ status }: { status: GeneratedProposalResponse['status'] }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
        status === 'FINAL'
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
          : 'bg-[var(--app-brand-soft)] text-[var(--app-brand-dark)]'
      }`}
    >
      {status}
    </span>
  );
}

function ProposalCard({ proposal }: { proposal: GeneratedProposalResponse }) {
  const t = useTranslations('proposals');
  const date = new Date(proposal.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--app-brand)] hover:shadow-md hover:shadow-[var(--app-brand-glow)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--app-brand-soft)] text-[var(--app-brand-dark)]">
          <Bot className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-[var(--app-text)]">{proposal.title ?? 'Proposal'}</p>
          <p className="mt-0.5 text-xs text-[var(--app-muted)]">{t('generated', { date })}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 pl-[60px] sm:pl-0">
        <StatusBadge status={proposal.status} />
        <Link
          className="flex items-center gap-1.5 rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-sm font-semibold text-[var(--app-muted)] transition hover:border-[var(--app-brand)] hover:text-[var(--app-brand-dark)]"
          href={`/proposals/${proposal.id}`}
        >
          <FileText className="h-3.5 w-3.5" />
          {t('view')}
        </Link>
      </div>
    </article>
  );
}

function EmptyState() {
  const t = useTranslations('proposals');
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-panel)] py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--app-hero)] text-[var(--app-brand)]">
        <ClipboardList className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-[var(--app-text)]">{t('empty')}</h3>
      <p className="mt-1 max-w-xs text-sm text-[var(--app-muted)]">{t('generateFirst')}</p>
      <Link
        className="mt-6 flex items-center gap-2 rounded-lg bg-[var(--app-brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--app-brand-dark)]"
        href="/generate-solution"
      >
        <Plus className="h-4 w-4" />
        {t('generateSolution')}
      </Link>
    </div>
  );
}

export function ProposalsClient() {
  const t = useTranslations('proposals');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => proposalApi.getAll(0, 50).then((r) => r.data.data),
  });

  const proposals = data?.content ?? [];

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--app-muted)]">
          {isLoading ? t('loading') : t('count', { count: data?.totalElements ?? 0 })}
        </p>
        <Link
          className="flex items-center gap-2 rounded-lg bg-[var(--app-brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--app-brand-dark)]"
          href="/generate-solution"
        >
          <Plus className="h-4 w-4" />
          {t('newSolution')}
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-[var(--app-brand)]" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          {t('failedToLoad')}
        </div>
      )}

      {!isLoading && !isError && proposals.length === 0 && <EmptyState />}

      {proposals.length > 0 && (
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}
    </div>
  );
}
