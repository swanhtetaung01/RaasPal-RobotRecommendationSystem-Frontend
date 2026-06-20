'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Send,
  Users,
} from 'lucide-react';
import { reportApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import type { ApiResponse, MonthlyReportSummary } from '@/types/api';

type Cadence = 'monthly' | 'weekly';

/** Returns the previous calendar month as "YYYY-MM" (the usual report period). */
function previousMonth(): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Monday of the previous full week as "YYYY-MM-DD" (the backend snaps any day to its ISO Monday). */
function previousWeekStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  const mondayOffset = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - mondayOffset);
  return toDateStr(d);
}

function errorMessage(e: unknown, fallback: string): string {
  const ax = e as { response?: { data?: { message?: string } } };
  return ax?.response?.data?.message ?? fallback;
}

/* ─── Result summary ──────────────────────────────────────────────────────── */

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-panel-alt)] px-3 py-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--app-brand-soft)] text-[var(--app-brand-dark)]">
        {icon}
      </span>
      <div>
        <p className="text-lg font-semibold leading-none text-[var(--app-text)]">{value}</p>
        <p className="mt-1 text-xs text-[var(--app-muted)]">{label}</p>
      </div>
    </div>
  );
}

function ResultView({ response }: { response: ApiResponse<MonthlyReportSummary> }) {
  const t = useTranslations('reports');
  const summary = response.data;

  if (summary.customersProcessed === 0 && summary.robotsReported === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-panel)] py-10 text-center">
        <FileSpreadsheet className="mx-auto h-8 w-8 text-[var(--app-muted)]" />
        <p className="mt-3 text-sm text-[var(--app-muted)]">{t('emptyResult', { month: summary.reportMonth })}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[var(--app-text)]">
          {t('resultTitle', { month: summary.reportMonth })}
        </p>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            summary.testMode
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
          }`}
        >
          {summary.testMode ? t('testModeBadge') : t('liveModeBadge')}
        </span>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <StatChip icon={<Users className="h-4 w-4" />} label={t('stats.customers')} value={summary.customersProcessed} />
        <StatChip icon={<FileSpreadsheet className="h-4 w-4" />} label={t('stats.robots')} value={summary.robotsReported} />
        <StatChip icon={<Send className="h-4 w-4" />} label={t('stats.messages')} value={summary.messagesSent} />
        <StatChip icon={<AlertTriangle className="h-4 w-4" />} label={t('stats.skipped')} value={summary.recipientsSkipped} />
      </div>

      {(summary.robotErrors > 0 || summary.sendErrors > 0) && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {t('errorCounts', { robotErrors: summary.robotErrors, sendErrors: summary.sendErrors })}
        </p>
      )}

      {summary.previews.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">{t('previewsTitle')}</p>
          {summary.previews.map((customer) => (
            <div key={customer.customerId} className="rounded-lg border border-[var(--app-border)] bg-[var(--app-panel-alt)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--app-text)]">{customer.customerName}</p>
                {!customer.lineUserId && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {t('noRecipient')}
                  </span>
                )}
              </div>
              <ul className="mt-2 space-y-1.5">
                {customer.robots.map((robot) => (
                  <li key={robot.serialNumber} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-sm text-[var(--app-text)]">
                      {robot.robotName ?? robot.serialNumber}
                      <span className="ml-2 text-xs text-[var(--app-muted)]">{robot.serialNumber}</span>
                    </span>
                    <a
                      href={robot.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--app-border)] px-2.5 py-1 text-xs font-semibold text-[var(--app-brand-dark)] transition hover:border-[var(--app-brand)]"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {t('downloadLabel')}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Panel ───────────────────────────────────────────────────────────────── */

/**
 * Manage the monthly report sending system: pick a month, preview the generated
 * files (test mode, no LINE spend), or send them live to customers via n8n/LINE.
 */
export function ReportAutomationPanel() {
  const t = useTranslations('reports');
  const [cadence, setCadence] = useState<Cadence>('monthly');
  const [month, setMonth] = useState(previousMonth);
  const [weekStart, setWeekStart] = useState(previousWeekStart);
  const [confirmLive, setConfirmLive] = useState(false);
  const [result, setResult] = useState<ApiResponse<MonthlyReportSummary> | null>(null);

  const maxMonth = useMemo(previousMonth, []);
  const today = useMemo(() => toDateStr(new Date()), []);

  /** Human-readable period for confirm/result copy. */
  const periodLabel = cadence === 'weekly' ? (weekStart || previousWeekStart()) : (month || maxMonth);

  const runMutation = useMutation({
    mutationFn: ({ testMode }: { testMode: boolean }) =>
      (cadence === 'weekly'
        ? reportApi.runWeekly(weekStart || undefined, testMode)
        : reportApi.runMonthly(month || undefined, testMode)
      ).then((r) => r.data),
    onSuccess: (res) => setResult(res),
  });

  function selectCadence(next: Cadence) {
    setCadence(next);
    setConfirmLive(false);
  }

  const previewPending = runMutation.isPending && runMutation.variables?.testMode === true;
  const livePending = runMutation.isPending && runMutation.variables?.testMode === false;

  function runPreview() {
    setConfirmLive(false);
    runMutation.mutate({ testMode: true });
  }

  function runLive() {
    setConfirmLive(false);
    runMutation.mutate({ testMode: false });
  }

  return (
    <div className="space-y-5">
      {/* Intro / how it works */}
      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-4">
        <p className="text-sm font-semibold text-[var(--app-text)]">{t('panel.heading')}</p>
        <p className="mt-1 text-xs text-[var(--app-muted)]">{t('panel.description')}</p>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-panel-alt)] px-3 py-2.5">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[var(--app-brand-dark)]" />
          <p className="text-xs text-[var(--app-muted)]">{t('autoNote')}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-4">
        {/* Cadence toggle */}
        <div className="mb-4 space-y-1.5">
          <p className="text-xs font-semibold text-[var(--app-muted)]">{t('cadenceLabel')}</p>
          <div className="inline-flex rounded-lg border border-[var(--app-border)] bg-[var(--app-panel-alt)] p-1">
            {(['monthly', 'weekly'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => selectCadence(c)}
                disabled={runMutation.isPending}
                className={`rounded-md px-4 py-1.5 text-sm font-semibold transition disabled:opacity-50 ${
                  cadence === c
                    ? 'bg-[var(--app-brand)] text-white shadow-sm'
                    : 'text-[var(--app-muted)] hover:text-[var(--app-text)]'
                }`}
              >
                {t(c === 'monthly' ? 'cadenceMonthly' : 'cadenceWeekly')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {cadence === 'monthly' ? (
            <div className="space-y-1.5">
              <label htmlFor="report-month" className="text-xs font-semibold text-[var(--app-muted)]">
                {t('monthLabel')}
              </label>
              <input
                id="report-month"
                type="month"
                value={month}
                max={maxMonth}
                onChange={(e) => {
                  setMonth(e.target.value);
                  setConfirmLive(false);
                }}
                className="block h-10 rounded-lg border border-[var(--app-border)] bg-[var(--app-panel-alt)] px-3 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-brand)]"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label htmlFor="report-week" className="text-xs font-semibold text-[var(--app-muted)]">
                {t('weekStartLabel')}
              </label>
              <input
                id="report-week"
                type="date"
                value={weekStart}
                max={today}
                onChange={(e) => {
                  setWeekStart(e.target.value);
                  setConfirmLive(false);
                }}
                className="block h-10 rounded-lg border border-[var(--app-border)] bg-[var(--app-panel-alt)] px-3 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-brand)]"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={runPreview}
              disabled={runMutation.isPending}
              className="border border-[var(--app-border)] bg-[var(--app-panel-alt)] text-[var(--app-text)] hover:border-[var(--app-brand)]"
            >
              {previewPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              {previewPending ? t('previewing') : t('previewButton')}
            </Button>

            <Button
              type="button"
              onClick={() => setConfirmLive(true)}
              disabled={runMutation.isPending}
              className="bg-[var(--app-brand)] text-white hover:opacity-90"
            >
              {livePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {livePending ? t('sending') : t('sendButton')}
            </Button>
          </div>
        </div>

        {confirmLive && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">{t('confirmTitle')}</p>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                  {t('confirmBody', { month: periodLabel })}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={runLive}
                    className="bg-amber-600 text-white hover:bg-amber-700"
                  >
                    <Send className="h-4 w-4" />
                    {t('confirmYes')}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setConfirmLive(false)}
                    className="border border-[var(--app-border)] bg-[var(--app-panel)] text-[var(--app-text)] hover:border-[var(--app-brand)]"
                  >
                    {t('confirmCancel')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {runMutation.isError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage(runMutation.error, t('errorGeneric'))}</span>
        </div>
      )}

      {result && (
        <>
          {result.message && (
            <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              {result.message}
            </p>
          )}
          <ResultView response={result} />
        </>
      )}
    </div>
  );
}
