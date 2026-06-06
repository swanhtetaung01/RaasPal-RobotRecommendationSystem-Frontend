'use client';

import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { recommendationApi } from '@/lib/api';
import type {
  RecommendationItemResponse,
  RecommendationResponse,
  RobotSpecResponse,
} from '@/types/api';
import { AppSidebar } from '@/components/AppSidebar';
import { AppTopBar } from '@/components/AppTopBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Bot,
  FileText,
  Lightbulb,
  Loader2,
  Trophy,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';

const RANK_STYLES = [
  { color: 'bg-amber-400/20 text-amber-600', icon: Trophy },
  { color: 'bg-[var(--app-brand-soft)] text-[var(--app-brand-dark)]', icon: BadgeCheck },
  { color: 'bg-[var(--app-faint)] text-[var(--app-muted)]', icon: Bot },
];

const FIT_LEVEL_STYLE: Record<string, string> = {
  HIGH: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  LOW: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
};

/** Split "1) foo. 2) bar." or newline-delimited text into an array of strings. */
function parseIntoLines(text: string): string[] {
  const trimmed = text.trim();
  const byNumber = trimmed.split(/(?=\b\d+[).]\s)/);
  if (byNumber.length > 1) {
    return byNumber.map((p) => p.replace(/^\d+[).]\s*/, '').trim()).filter(Boolean);
  }
  const byLine = trimmed.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  if (byLine.length > 1) return byLine;
  return [trimmed];
}

function buildSpecChips(spec: RobotSpecResponse): { label: string; value: string }[] {
  const chips: { label: string; value: string }[] = [];
  if (spec.lengthMm && spec.widthMm && spec.heightMm) {
    chips.push({ label: 'Body Size', value: `${spec.lengthMm}×${spec.widthMm}×${spec.heightMm} mm` });
  }
  if (spec.widthCleaningMm) {
    chips.push({ label: 'Cleaning Width', value: `${spec.widthCleaningMm} mm` });
  }
  const cleanTank = spec.tankCapacityCleanL != null ? `${spec.tankCapacityCleanL}L` : null;
  const wasteTank = spec.tankCapacityWasteL != null ? `${spec.tankCapacityWasteL}L` : null;
  if (cleanTank || wasteTank) {
    chips.push({ label: 'Tanks (Clean/Waste)', value: [cleanTank, wasteTank].filter(Boolean).join(' / ') });
  }
  if (spec.batteryWorkTimeSweepHr != null) {
    chips.push({ label: 'Battery (Sweep)', value: `${spec.batteryWorkTimeSweepHr} hr` });
  }
  if (spec.batteryWorkTimeScrubHr != null) {
    chips.push({ label: 'Battery (Scrub)', value: `${spec.batteryWorkTimeScrubHr} hr` });
  }
  if (spec.batteryChargingTimeHr != null) {
    chips.push({ label: 'Charge Time', value: `${spec.batteryChargingTimeHr} hr` });
  }
  const navParts: string[] = [];
  if (spec.navigationLidar2d) navParts.push('2D LiDAR');
  if (spec.navigationLidar3d) navParts.push('3D LiDAR');
  if (spec.navigationCameraVslam) navParts.push('VSLAM');
  if (navParts.length) chips.push({ label: 'Navigation', value: navParts.join(', ') });
  if (spec.minimumPassableWidthMm != null) {
    chips.push({ label: 'Min Pass Width', value: `${spec.minimumPassableWidthMm} mm` });
  }
  if (spec.speedMs != null) {
    chips.push({ label: 'Speed', value: `${spec.speedMs} m/s` });
  }
  if (spec.ipRating) chips.push({ label: 'IP Rating', value: spec.ipRating });
  if (spec.workStation != null) {
    chips.push({ label: 'Auto Dock', value: spec.workStation ? 'Yes' : 'No' });
  }
  if (spec.cleaningEfficiencySweepScrubSqmH != null) {
    chips.push({ label: 'Efficiency (Sweep+Scrub)', value: `${spec.cleaningEfficiencySweepScrubSqmH} m²/h` });
  } else {
    if (spec.cleaningEfficiencySweepSqmH != null) {
      chips.push({ label: 'Efficiency (Sweep)', value: `${spec.cleaningEfficiencySweepSqmH} m²/h` });
    }
    if (spec.cleaningEfficiencyScrubSqmH != null) {
      chips.push({ label: 'Efficiency (Scrub)', value: `${spec.cleaningEfficiencyScrubSqmH} m²/h` });
    }
  }
  if (spec.noiseLevelDb != null) {
    chips.push({ label: 'Noise', value: `${spec.noiseLevelDb} dB` });
  }
  return chips;
}

function RobotImage({ imageUrl, model }: { imageUrl: string | null; model: string }) {
  const [hasError, setHasError] = useState(false);
  if (!imageUrl || hasError) {
    return (
      <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-xl bg-[var(--app-faint)]">
        <Bot className="h-14 w-14 text-[var(--app-muted)] opacity-30" />
      </div>
    );
  }
  return (
    <Image
      alt={model}
      className="h-36 w-36 shrink-0 rounded-xl bg-[var(--app-faint)] object-contain p-2"
      height={144}
      onError={() => setHasError(true)}
      src={imageUrl}
      unoptimized
      width={144}
    />
  );
}

function BulletList({ items, color = 'bg-[var(--app-muted)]' }: { items: string[]; color?: string }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm leading-5 text-[var(--app-text)]">
          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full opacity-60 ${color}`} />
          {item}
        </li>
      ))}
    </ul>
  );
}

function RobotCard({
  item,
  rankLabels,
  onSelect,
}: {
  item: RecommendationItemResponse;
  rankLabels: string[];
  onSelect: () => void;
}) {
  const t = useTranslations('generateSolution.recommendation');
  const style = RANK_STYLES[item.rankPosition - 1] ?? RANK_STYLES[2];
  const label = rankLabels[item.rankPosition - 1] ?? rankLabels[2];
  const RankIcon = style.icon;
  const fitKey = item.fitLevel?.toUpperCase() ?? '';
  const fitStyle = FIT_LEVEL_STYLE[fitKey] ?? null;
  const specChips = item.robot.spec ? buildSpecChips(item.robot.spec) : [];
  const whyLines = item.whyRecommended ? parseIntoLines(item.whyRecommended) : [];
  const limitationLines = item.limitations ? parseIntoLines(item.limitations) : [];
  const missingLines = item.missingInformation ? parseIntoLines(item.missingInformation) : [];

  return (
    <article className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] shadow-sm">
      {/* ── Identity ── */}
      <div className="flex flex-wrap items-start gap-4 p-5">
        <RobotImage imageUrl={item.robot.imageUrl} model={item.robot.model} />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* Title row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.color}`}>
              <RankIcon className="h-4 w-4" />
            </span>
            <h3 className="text-xl font-bold text-[var(--app-text)]">{item.robot.model}</h3>
            <Badge className={`text-xs font-semibold ${style.color}`} variant="secondary">
              {label}
            </Badge>
            {fitStyle && item.fitLevel && (
              <Badge className={`text-xs font-medium ${fitStyle}`} variant="secondary">
                {item.fitLevel} Fit
              </Badge>
            )}
          </div>

          {/* Brand */}
          <p className="text-sm font-semibold text-[var(--app-muted)]">{item.robot.brand}</p>

          {/* Price */}
          {(item.robot.rentalPrice != null || item.robot.sellingPrice != null) && (
            <div className="flex flex-wrap gap-4 text-sm">
              {item.robot.rentalPrice != null && (
                <span className="text-[var(--app-muted)]">
                  Rental:{' '}
                  <span className="font-semibold text-[var(--app-text)]">
                    ฿{item.robot.rentalPrice.toLocaleString()}/mo
                  </span>
                </span>
              )}
              {item.robot.sellingPrice != null && (
                <span className="text-[var(--app-muted)]">
                  Purchase:{' '}
                  <span className="font-semibold text-[var(--app-text)]">
                    ฿{item.robot.sellingPrice.toLocaleString()}
                  </span>
                </span>
              )}
            </div>
          )}

          {/* Select button */}
          <div className="pt-1">
            <Button
              className="gap-1.5 bg-[var(--app-brand)] text-sm text-white hover:bg-[var(--app-brand-dark)]"
              onClick={onSelect}
              size="sm"
              type="button"
            >
              {t('selectRobot')}
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Key Specs ── */}
      {specChips.length > 0 && (
        <div className="border-t border-[var(--app-border)] px-5 py-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--app-muted)]">
            Key Specs
          </p>
          <div className="flex flex-wrap gap-2">
            {specChips.map((chip) => (
              <div
                key={chip.label}
                className="rounded-lg border border-[var(--app-border)] bg-[var(--app-faint)] px-3 py-1.5"
              >
                <p className="text-[10px] font-semibold uppercase leading-none text-[var(--app-muted)]">
                  {chip.label}
                </p>
                <p className="mt-0.5 text-sm font-medium text-[var(--app-text)]">{chip.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Why / Limitations ── */}
      {(whyLines.length > 0 || limitationLines.length > 0) && (
        <div className="grid gap-5 border-t border-[var(--app-border)] p-5 sm:grid-cols-2">
          {whyLines.length > 0 && (
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                {t('whyRecommended')}
              </p>
              <BulletList items={whyLines} color="bg-emerald-500" />
            </div>
          )}
          {limitationLines.length > 0 && (
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                {t('limitations')}
              </p>
              <BulletList items={limitationLines} color="bg-amber-500" />
            </div>
          )}
        </div>
      )}

      {/* ── Business Value ── */}
      {item.businessValue && (
        <div className="border-t border-[var(--app-border)] px-5 py-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--app-brand)]">
            Business Value
          </p>
          <p className="text-sm leading-5 text-[var(--app-text)]">{item.businessValue}</p>
        </div>
      )}

      {/* ── Missing Information ── */}
      {missingLines.length > 0 && (
        <div className="border-t border-[var(--app-border)] px-5 py-4">
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700/50 dark:bg-amber-900/30">
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Missing Information
              </p>
            </div>
            <BulletList
              items={missingLines}
              color="bg-amber-500 dark:bg-amber-400"
            />
          </div>
        </div>
      )}

      {/* ── Suggested Next Step ── */}
      {item.suggestedNextStep && (
        <div className="border-t border-[var(--app-border)] px-5 py-4">
          <div className="rounded-lg border border-[var(--app-brand-soft)] bg-[var(--app-brand-soft)]/20 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-[var(--app-brand)]" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--app-brand)]">
                Suggested Next Step
              </p>
            </div>
            <p className="text-sm leading-5 text-[var(--app-text)]">{item.suggestedNextStep}</p>
          </div>
        </div>
      )}
    </article>
  );
}

interface RecommendationClientProps {
  locale: string;
  solutionType: string;
}

function RecommendationInner({ solutionType }: Pick<RecommendationClientProps, 'solutionType'>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('generateSolution.recommendation');
  const reqId = searchParams.get('reqId');
  const recId = searchParams.get('recId');
  const solutionName = searchParams.get('solutionName') ?? undefined;

  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const catchErr = (err: unknown) => {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          t('errorGeneric'),
      );
    };

    if (recId) {
      recommendationApi
        .getById(recId)
        .then((res) => {
          if (res.data.success) setRecommendation(res.data.data);
          else setError(res.data.message ?? t('failedGenerate'));
        })
        .catch(catchErr)
        .finally(() => setLoading(false));
    } else if (reqId) {
      recommendationApi
        .generate(reqId, solutionName ? { name: solutionName } : undefined)
        .then((res) => {
          if (res.data.success) setRecommendation(res.data.data);
          else setError(res.data.message ?? t('failedGenerate'));
        })
        .catch(catchErr)
        .finally(() => setLoading(false));
    } else {
      setError(t('noRequirementId'));
      setLoading(false);
    }
  }, [reqId, recId, solutionName]);

  function handleSelect(item: RecommendationItemResponse) {
    if (!recommendation) return;
    router.push(
      `/generate-solution/${solutionType}/proposal?itemId=${item.id}&recId=${recommendation.id}`,
      { locale },
    );
  }

  return (
    <main className="min-h-dvh bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
      <div className="flex min-h-dvh">
        <AppSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <AppTopBar
            eyebrow={t('eyebrow')}
            searchPlaceholder="Search customers, sites, robot criteria"
            title={t('title')}
          />

          <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
            {/* Back link */}
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--app-muted)] hover:text-[var(--app-brand-dark)]"
              href={`/generate-solution/${solutionType}/upload`}
            >
              <ArrowLeft className="h-4 w-4" />
              {t('backToUpload')}
            </Link>

            {/* Header */}
            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-hero)] p-6 text-white shadow-sm">
              <p className="text-sm font-semibold uppercase text-cyan-100">{t('step')}</p>
              <h2 className="mt-2 text-2xl font-bold">{t('heading')}</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-white/70">{t('description')}</p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center gap-4 py-16">
                <Loader2 className="h-10 w-10 animate-spin text-[var(--app-brand)]" />
                <p className="font-semibold text-[var(--app-text)]">{t('loading')}</p>
                <p className="text-sm text-[var(--app-muted)]">{t('loadingSub')}</p>
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
                    <p className="mb-2 text-xs font-semibold uppercase text-[var(--app-muted)]">
                      {t('aiSummary')}
                    </p>
                    <p className="text-sm leading-6 text-[var(--app-text)]">
                      {recommendation.aiExplanation}
                    </p>
                    <p className="mt-3 text-xs italic text-[var(--app-muted)]">
                      {t('verificationNote')}
                    </p>
                  </div>
                )}

                {/* Robot cards */}
                <div className="space-y-6">
                  {recommendation.options
                    .slice()
                    .sort((a, b) => a.rankPosition - b.rankPosition)
                    .map((item) => {
                      const rankLabels = [t('rankBest'), t('rank2'), t('rank3')];
                      return (
                        <RobotCard
                          key={item.id}
                          item={item}
                          onSelect={() => handleSelect(item)}
                          rankLabels={rankLabels}
                        />
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
