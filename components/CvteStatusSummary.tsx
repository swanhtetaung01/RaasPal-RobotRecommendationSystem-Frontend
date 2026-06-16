'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { ChevronRight, Loader2, Radio } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cvteApi } from '@/lib/api';
import { CvteStatusBadge } from '@/components/CvteStatusBadge';

const PREVIEW_COUNT = 4;
const REFRESH_MS = 60_000;

/**
 * Compact "less detail" preview of CVTE C3 online/offline status for the
 * Team Dashboard — links through to the Tools page (monitor tab) for the table view.
 */
export function CvteStatusSummary() {
  const t = useTranslations('teamDashboard.cvteSummary');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['cvte-devices', 'summary'],
    queryFn: () => cvteApi.getAll(0, 100).then((r) => r.data.data),
    refetchInterval: REFRESH_MS,
  });

  const devices = data?.content ?? [];
  const onlineCount = devices.filter((d) => d.onlineStatus === true).length;
  const offlineCount = devices.filter((d) => d.onlineStatus === false).length;
  const preview = devices.slice(0, PREVIEW_COUNT);

  return (
    <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--app-brand-soft)] text-[var(--app-brand-dark)]">
            <Radio className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-[var(--app-text)]">{t('heading')}</p>
        </div>
        <Link
          className="flex items-center gap-1 text-xs font-semibold text-[var(--app-muted)] transition hover:text-[var(--app-brand-dark)]"
          href="/tools"
        >
          {t('viewAll')}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--app-brand)]" />
        </div>
      )}

      {isError && (
        <p className="mt-3 text-xs text-[var(--app-muted)]">{t('failedToLoad')}</p>
      )}

      {!isLoading && !isError && devices.length === 0 && (
        <p className="mt-3 text-xs text-[var(--app-muted)]">{t('empty')}</p>
      )}

      {!isLoading && !isError && devices.length > 0 && (
        <>
          <div className="mt-3 flex items-center gap-4 text-xs text-[var(--app-muted)]">
            <span>{t('onlineCount', { count: onlineCount })}</span>
            <span>{t('offlineCount', { count: offlineCount })}</span>
            <span>{t('totalCount', { count: devices.length })}</span>
          </div>
          <ul className="mt-3 space-y-1.5">
            {preview.map((device) => (
              <li key={device.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-[var(--app-text)]">{device.deviceName ?? device.factorySn}</span>
                <CvteStatusBadge online={device.onlineStatus} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
