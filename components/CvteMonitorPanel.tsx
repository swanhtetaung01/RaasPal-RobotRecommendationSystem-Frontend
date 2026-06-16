'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Loader2, Radio, RefreshCw, Search, X, Zap } from 'lucide-react';
import { cvteApi } from '@/lib/api';
import { CvteStatusBadge } from '@/components/CvteStatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CvteDeviceResponse, CvteDeviceSyncRequest } from '@/types/api';

const AUTO_REFRESH_MS = 45_000;

function isCharging(runningState: string | null) {
  return !!runningState && /charg/i.test(runningState);
}

/** Small battery glyph whose fill bar reflects the actual charge level (red/amber/green by range). */
function BatteryGauge({ percentage }: { percentage: number }) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const fillColor = clamped <= 20 ? '#ef4444' : clamped <= 50 ? '#f59e0b' : '#10b981';
  const fillWidth = clamped <= 0 ? 0 : Math.max(1.5, (clamped / 100) * 12);

  return (
    <svg width="22" height="12" viewBox="0 0 22 12" className="shrink-0" aria-hidden>
      <rect x="1" y="1" width="16" height="10" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-[var(--app-muted)]" />
      <rect x="18.5" y="4" width="2.5" height="4" rx="1" fill="currentColor" className="text-[var(--app-muted)]" />
      <rect x="3" y="3" width={fillWidth} height="6" rx="1" fill={fillColor} />
    </svg>
  );
}

function formatDateTime(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ─── Sync form ───────────────────────────────────────────────────────────── */

function SyncForm({
  onSync,
  isSyncing,
}: {
  onSync: (filters: CvteDeviceSyncRequest) => void;
  isSyncing: boolean;
}) {
  const t = useTranslations('cvte.syncForm');
  const [factorySn, setFactorySn] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [orgCode, setOrgCode] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSync({
      factorySn: factorySn.trim() || undefined,
      deviceName: deviceName.trim() || undefined,
      orgCode: orgCode.trim() || undefined,
    });
  }

  const inputClassName = 'border-[var(--app-border)] bg-[var(--app-panel-alt)] text-[var(--app-text)] placeholder:text-[var(--app-muted)] focus-visible:ring-[var(--app-brand)]';

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-4">
      <p className="text-sm font-semibold text-[var(--app-text)]">{t('heading')}</p>
      <p className="mt-1 text-xs text-[var(--app-muted)]">{t('description')}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[var(--app-muted)]" htmlFor="cvte-factory-sn">
            {t('factorySnLabel')}
          </Label>
          <Input
            id="cvte-factory-sn"
            className={inputClassName}
            value={factorySn}
            onChange={(e) => setFactorySn(e.target.value)}
            placeholder={t('factorySnPlaceholder')}
            disabled={isSyncing}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[var(--app-muted)]" htmlFor="cvte-device-name">
            {t('deviceNameLabel')}
          </Label>
          <Input
            id="cvte-device-name"
            className={inputClassName}
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder={t('deviceNamePlaceholder')}
            disabled={isSyncing}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-[var(--app-muted)]" htmlFor="cvte-org-code">
            {t('orgCodeLabel')}
          </Label>
          <Input
            id="cvte-org-code"
            className={inputClassName}
            value={orgCode}
            onChange={(e) => setOrgCode(e.target.value)}
            placeholder={t('orgCodePlaceholder')}
            disabled={isSyncing}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button type="submit" disabled={isSyncing} className="bg-[var(--app-brand)] text-white hover:opacity-90">
          {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {isSyncing ? t('syncing') : t('submit')}
        </Button>
      </div>
    </form>
  );
}

/* ─── Device table ────────────────────────────────────────────────────────── */

function DeviceRow({ device, onPoll, isPolling }: { device: CvteDeviceResponse; onPoll: () => void; isPolling: boolean }) {
  const t = useTranslations('cvte');
  const lastChecked = formatDateTime(device.lastCheckedAt);

  return (
    <tr className="border-b border-[var(--app-border)] last:border-0">
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-[var(--app-text)]">{device.deviceName ?? '—'}</p>
        <p className="text-xs text-[var(--app-muted)]">{device.factorySn} · #{device.deviceId}</p>
      </td>
      <td className="px-4 py-3"><CvteStatusBadge online={device.onlineStatus} /></td>
      <td className="px-4 py-3 text-sm text-[var(--app-text)]">{device.runningState ?? '—'}</td>
      <td className="px-4 py-3 text-sm text-[var(--app-text)]">
        {device.batteryPercentage != null ? (
          <span className="inline-flex items-center gap-1.5">
            <BatteryGauge percentage={device.batteryPercentage} />
            {isCharging(device.runningState) && <Zap className="h-3.5 w-3.5 text-emerald-500" />}
            {Math.round(device.batteryPercentage)}%
          </span>
        ) : (
          '—'
        )}
      </td>
      <td className="px-4 py-3 text-xs text-[var(--app-muted)]">
        {lastChecked ?? t('neverChecked')}
        {device.lastMessage && <p className="mt-0.5 truncate max-w-[16rem]" title={device.lastMessage}>{device.lastMessage}</p>}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={onPoll}
          disabled={isPolling}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--app-border)] px-2.5 py-1 text-xs font-semibold text-[var(--app-muted)] transition hover:border-[var(--app-brand)] hover:text-[var(--app-brand-dark)] disabled:opacity-50"
        >
          {isPolling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {t('pollNow')}
        </button>
      </td>
    </tr>
  );
}

/* ─── Panel ───────────────────────────────────────────────────────────────── */

/**
 * Self-contained CVTE C3 online/offline monitoring panel (sync form + live
 * table + per-device poll). Owns its own search box so it can be embedded in a
 * tab without depending on the page top bar.
 */
export function CvteMonitorPanel() {
  const t = useTranslations('cvte');
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['cvte-devices'],
    queryFn: () => cvteApi.getAll(0, 200).then((r) => r.data.data),
    refetchInterval: AUTO_REFRESH_MS,
  });

  const syncMutation = useMutation({
    mutationFn: (filters: CvteDeviceSyncRequest) => cvteApi.sync(filters),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cvte-devices'] }),
  });

  const pollAllMutation = useMutation({
    mutationFn: () => cvteApi.pollAll(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cvte-devices'] }),
  });

  const pollOneMutation = useMutation({
    mutationFn: (deviceId: string) => cvteApi.pollOne(deviceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cvte-devices'] }),
  });

  const all = data?.content ?? [];
  const query = searchQuery.trim().toLowerCase();
  const filtered = query
    ? all.filter((d) => (d.deviceName ?? '').toLowerCase().includes(query) || d.factorySn.toLowerCase().includes(query))
    : all;

  return (
    <div className="space-y-5">
      <SyncForm onSync={(filters) => syncMutation.mutate(filters)} isSyncing={syncMutation.isPending} />

      {syncMutation.isError && (
        <p className="text-sm text-red-600 dark:text-red-400">{t('syncError')}</p>
      )}
      {syncMutation.isSuccess && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          {t('syncSuccess', { count: syncMutation.data?.data.data?.length ?? 0 })}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex h-10 w-full max-w-xs items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 shrink-0 text-[var(--app-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="h-full w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-panel-alt)] pl-9 pr-8 text-sm text-[var(--app-text)] placeholder:text-[var(--app-muted)] outline-none focus:border-[var(--app-brand)] transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 rounded p-0.5 text-[var(--app-muted)] hover:text-[var(--app-text)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm text-[var(--app-muted)]">{t('deviceCount', { count: filtered.length })}</p>
          <button
            type="button"
            onClick={() => pollAllMutation.mutate()}
            disabled={pollAllMutation.isPending || all.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-sm font-semibold text-[var(--app-muted)] transition hover:border-[var(--app-brand)] hover:text-[var(--app-brand-dark)] disabled:opacity-50"
          >
            {pollAllMutation.isPending || isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {pollAllMutation.isPending ? t('refreshing') : t('refresh')}
          </button>
        </div>
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

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-panel)] py-16 text-center">
          <Radio className="mx-auto h-8 w-8 text-[var(--app-muted)]" />
          <p className="mt-3 text-sm text-[var(--app-muted)]">{t('empty')}</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--app-border)] text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                <th className="px-4 py-3">{t('table.device')}</th>
                <th className="px-4 py-3">{t('table.status')}</th>
                <th className="px-4 py-3">{t('table.runningState')}</th>
                <th className="px-4 py-3">{t('table.battery')}</th>
                <th className="px-4 py-3">{t('table.lastChecked')}</th>
                <th className="px-4 py-3 text-right">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((device) => (
                <DeviceRow
                  key={device.id}
                  device={device}
                  onPoll={() => pollOneMutation.mutate(device.deviceId)}
                  isPolling={pollOneMutation.isPending && pollOneMutation.variables === device.deviceId}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
