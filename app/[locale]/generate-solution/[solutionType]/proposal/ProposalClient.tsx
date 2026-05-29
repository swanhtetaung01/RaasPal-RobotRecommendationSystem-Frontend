/**
 * ProposalClient.tsx
 * Client component — generates the proposal and displays the result.
 *
 * Flow:
 *   1. Read recId + robotId from URL search params
 *   2. POST /api/v1/proposals/generate { recommendationId, selectedRobotId }
 *   3. Display proposal content
 *   4. Copy / print actions
 */

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { proposalApi } from '@/lib/api';
import type { GeneratedProposalResponse } from '@/types/api';
import { AppSidebar } from '@/components/AppSidebar';
import { AppTopBar } from '@/components/AppTopBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCopy,
  Download,
  FileText,
  Loader2,
  Printer,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { exportProposalToPdf } from '@/lib/pdf-export';

interface ProposalClientProps {
  locale: string;
  solutionType: string;
}

function ProposalInner({ solutionType }: Pick<ProposalClientProps, 'solutionType'>) {
  const searchParams = useSearchParams();
  const recId = searchParams.get('recId');
  const robotId = searchParams.get('robotId');

  const [proposal, setProposal] = useState<GeneratedProposalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!recId || !robotId) {
      setError('Missing recommendation or robot ID. Please start from the upload step.');
      setLoading(false);
      return;
    }

    proposalApi
      .generate({ recommendationId: recId, selectedRobotId: robotId })
      .then((res) => {
        if (res.data.success) {
          setProposal(res.data.data);
        } else {
          setError(res.data.message ?? 'Failed to generate proposal');
        }
      })
      .catch((err: unknown) => {
        setError(
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Something went wrong while generating the proposal',
        );
      })
      .finally(() => setLoading(false));
  }, [recId, robotId]);

  async function handleCopy() {
    if (!proposal?.content) return;
    await navigator.clipboard.writeText(proposal.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadPdf() {
    if (!proposal) return;
    setDownloading(true);
    try {
      await exportProposalToPdf(proposal);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
      <div className="flex min-h-dvh">
        <AppSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <AppTopBar
            eyebrow="Generate solution · Proposal"
            searchPlaceholder="Search customers, sites, robot criteria"
            title="Generated Proposal"
          />

          <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">
            {/* Back link */}
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--app-muted)] hover:text-[var(--app-brand-dark)]"
              href={`/generate-solution/${solutionType}/recommendation`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to recommendations
            </Link>

            {/* Header */}
            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-hero)] p-6 text-white shadow-sm">
              <p className="text-sm font-semibold uppercase text-cyan-100">Step 3 of 3 · Proposal</p>
              <h2 className="mt-2 text-2xl font-bold">Customer Proposal</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-white/70">
                The AI-generated proposal below is based on the selected robot and customer requirements.
                Review and verify before sending to the customer.
              </p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center gap-4 py-16">
                <Loader2 className="h-10 w-10 animate-spin text-[var(--app-brand)]" />
                <p className="font-semibold text-[var(--app-text)]">Generating proposal…</p>
                <p className="text-sm text-[var(--app-muted)]">AI is preparing the customer proposal document</p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Proposal content */}
            {proposal && !loading && (
              <>
                {/* Meta */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--app-brand-soft)] text-[var(--app-brand-dark)]">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-[var(--app-text)]">{proposal.selectedRobotName}</p>
                      <p className="text-xs text-[var(--app-muted)]">
                        Generated {new Date(proposal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      proposal.status === 'FINAL'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }
                    variant="secondary"
                  >
                    {proposal.status}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="gap-2 bg-[var(--app-brand)] text-white hover:bg-[var(--app-brand-dark)]"
                    disabled={downloading}
                    onClick={handleDownloadPdf}
                    type="button"
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Preparing PDF…
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download PDF
                      </>
                    )}
                  </Button>
                  <Button
                    className="gap-2 border-[var(--app-border)] bg-[var(--app-panel)] text-[var(--app-text)] hover:bg-[var(--app-faint)]"
                    onClick={handleCopy}
                    type="button"
                    variant="outline"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="h-4 w-4" />
                        Copy text
                      </>
                    )}
                  </Button>
                  <Button
                    className="gap-2 border-[var(--app-border)] bg-[var(--app-panel)] text-[var(--app-text)] hover:bg-[var(--app-faint)]"
                    onClick={() => window.print()}
                    type="button"
                    variant="outline"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                </div>

                {/* Proposal body */}
                <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-6">
                  {proposal.content ? (
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-[var(--app-text)]">
                      {proposal.content}
                    </pre>
                  ) : (
                    <p className="text-sm italic text-[var(--app-muted)]">
                      No content returned. The backend AI provider may need configuration.
                    </p>
                  )}
                </div>

                {/* Disclaimer */}
                <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 px-5 py-4 text-sm text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
                  <p className="font-semibold">⚠ RAASPAL Verification Required</p>
                  <p className="mt-1">
                    This proposal was AI-generated from customer requirements and the robot catalog.
                    Final specifications, pricing, and site suitability must be confirmed by RAASPAL
                    team and an on-site survey before presenting to the customer.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

/** Outer wrapper provides a Suspense boundary for useSearchParams(). */
export function ProposalClient(props: ProposalClientProps) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-[var(--app-bg)]">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--app-brand)]" />
        </main>
      }
    >
      <ProposalInner solutionType={props.solutionType} />
    </Suspense>
  );
}
