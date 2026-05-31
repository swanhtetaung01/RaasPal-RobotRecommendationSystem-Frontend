/**
 * RecommendationClient.tsx
 * Client component — generates and displays robot recommendations.
 *
 * Flow:
 *   1. Read reqId from URL search params
 *   2. POST /api/v1/recommendations/generate/{requirementId}
 *   3. Display ranked items (rank 1–3)
 *   4. User clicks "Select" on a robot → navigate to proposal page
 */

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { recommendationApi } from '@/lib/api';
import type { RecommendationItemResponse, RecommendationResponse } from '@/types/api';
import { AppSidebar } from '@/components/AppSidebar';
import { AppTopBar } from '@/components/AppTopBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BadgeCheck, Bot, ChevronRight, Loader2, Trophy } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';

const rankMeta = [
  { label: 'Best match', color: 'bg-amber-400/20 text-amber-600', icon: Trophy },
  { label: '2nd option', color: 'bg-[var(--app-brand-soft)] text-[var(--app-brand-dark)]', icon: BadgeCheck },
  { label: '3rd option', color: 'bg-[var(--app-faint)] text-[var(--app-muted)]', icon: Bot },
];

interface RecommendationClientProps {
  locale: string;
  solutionType: string;
}

function RecommendationInner({ solutionType }: Pick<RecommendationClientProps, 'solutionType'>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const reqId = searchParams.get('reqId');

  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reqId) {
      setError('No requirement ID found. Please upload the survey file again.');
      setLoading(false);
      return;
    }

    recommendationApi
      .generate(reqId)
      .then((res) => {
        if (res.data.success) {
          setRecommendation(res.data.data);
        } else {
          setError(res.data.message ?? 'Failed to generate recommendations');
        }
      })
      .catch((err: unknown) => {
        setError(
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Something went wrong while generating recommendations',
        );
      })
      .finally(() => setLoading(false));
  }, [reqId]);

  function handleSelect(item: RecommendationItemResponse) {
    if (!recommendation) return;
    router.push(
      `/generate-solution/${solutionType}/proposal?recId=${recommendation.id}&robotId=${item.robot.id}`,
      { locale },
    );
  }

  return (
    <main className="min-h-dvh bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
      <div className="flex min-h-dvh">
        <AppSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <AppTopBar
            eyebrow="Generate solution · Recommendations"
            searchPlaceholder="Search customers, sites, robot criteria"
            title="Robot Recommendations"
          />

          <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">
            {/* Back link */}
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--app-muted)] hover:text-[var(--app-brand-dark)]"
              href={`/generate-solution/${solutionType}/upload`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to upload
            </Link>

            {/* Header */}
            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-hero)] p-6 text-white shadow-sm">
              <p className="text-sm font-semibold uppercase text-cyan-100">Step 2 of 3 · Review recommendations</p>
              <h2 className="mt-2 text-2xl font-bold">AI-Generated Robot Recommendations</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-white/70">
                The AI compared the customer requirements against the verified robot catalog.
                Select the best fit to generate the proposal.
              </p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center gap-4 py-16">
                <Loader2 className="h-10 w-10 animate-spin text-[var(--app-brand)]" />
                <p className="font-semibold text-[var(--app-text)]">Generating recommendations…</p>
                <p className="text-sm text-[var(--app-muted)]">AI is comparing requirements against the robot catalog</p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Results */}
            {recommendation && !loading && (
              <>
                {/* AI summary */}
                {recommendation.aiExplanation && (
                  <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-5">
                    <p className="mb-2 text-xs font-semibold uppercase text-[var(--app-muted)]">AI summary</p>
                    <p className="text-sm leading-6 text-[var(--app-text)]">{recommendation.aiExplanation}</p>
                    <p className="mt-3 text-xs text-[var(--app-muted)] italic">
                      Final selection requires RAASPAL team verification and site survey.
                    </p>
                  </div>
                )}

                {/* Robot cards */}
                <div className="space-y-4">
                  {recommendation.options
                    .slice()
                    .sort((a, b) => a.rankPosition - b.rankPosition)
                    .map((item) => {
                      const meta = rankMeta[item.rankPosition - 1] ?? rankMeta[2];
                      const RankIcon = meta.icon;
                      return (
                        <article
                          key={item.id}
                          className="rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-5 shadow-sm"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${meta.color}`}>
                                <RankIcon className="h-6 w-6" />
                              </span>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-lg font-bold text-[var(--app-text)]">{item.robot.model}</h3>
                                  <Badge className={`text-xs font-semibold ${meta.color}`} variant="secondary">
                                    {meta.label}
                                  </Badge>
                                </div>
                                <p className="mt-0.5 text-sm text-[var(--app-muted)]">{item.robot.brand}</p>
                              </div>
                            </div>

                            <Button
                              className="shrink-0 gap-1.5 bg-[var(--app-brand)] text-sm text-white hover:bg-[var(--app-brand-dark)]"
                              onClick={() => handleSelect(item)}
                              size="sm"
                              type="button"
                            >
                              Select this robot
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>

                          {item.aiReasoning && (
                            <p className="mt-4 text-sm leading-6 text-[var(--app-text)]">{item.aiReasoning}</p>
                          )}

                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            {item.whyRecommended && (
                              <div>
                                <p className="mb-2 text-xs font-semibold uppercase text-emerald-600">Why recommended</p>
                                <p className="text-sm leading-6 text-[var(--app-text)]">{item.whyRecommended}</p>
                              </div>
                            )}
                            {item.limitations && (
                              <div>
                                <p className="mb-2 text-xs font-semibold uppercase text-amber-600">Limitations</p>
                                <p className="text-sm leading-6 text-[var(--app-text)]">{item.limitations}</p>
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })}
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
export function RecommendationClient(props: RecommendationClientProps) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-[var(--app-bg)]">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--app-brand)]" />
        </main>
      }
    >
      <RecommendationInner solutionType={props.solutionType} />
    </Suspense>
  );
}
