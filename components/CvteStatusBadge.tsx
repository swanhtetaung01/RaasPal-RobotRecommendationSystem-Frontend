'use client';

import { useTranslations } from 'next-intl';

/**
 * Online/offline indicator for CVTE C3 devices — shared between the dedicated
 * status page and the compact dashboard summary. Kept separate from the
 * Robot catalog badges (see [[CvteDevice]] on the backend).
 */
export function CvteStatusBadge({ online }: { online: boolean | null | undefined }) {
  const t = useTranslations('cvte.status');

  const styles =
    online === true
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
      : online === false
        ? 'bg-gray-200 text-gray-600 dark:bg-gray-800/60 dark:text-gray-400'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';

  const label = online === true ? t('online') : online === false ? t('offline') : t('unknown');
  const dot = online === true ? 'bg-emerald-500' : online === false ? 'bg-gray-400' : 'bg-amber-500';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
