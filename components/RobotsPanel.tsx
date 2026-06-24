'use client';

/**
 * RobotsPanel — admin management of robot units and their deployment.
 *
 * Register a robot by serial number, link it to a customer (dropdown), set its
 * report cadence, and manage the list (change cadence inline, or deactivate).
 * Pairs with CustomersPanel: a robot must be deployed to an existing customer.
 */
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Bot,
  Building2,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { customerApi, robotUnitApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import type { RegisterRobotRequest, ReportCadence, RobotUnitResponse } from '@/types/api';

const BRANDS = ['GAUSIUM', 'KEENON', 'CENOBOT'];
const CADENCES: ReportCadence[] = ['MONTHLY', 'WEEKLY', 'OFF'];

function errorMessage(e: unknown, fallback: string): string {
  const ax = e as { response?: { data?: { message?: string } } };
  return ax?.response?.data?.message ?? fallback;
}

function robotDisplayName(r: RobotUnitResponse): string {
  return r.name ?? [r.brand, r.model].filter(Boolean).join(' ') ?? r.serialNumber;
}

const inputClass =
  'h-10 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-panel-alt)] px-3 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-brand)]';

const EMPTY_FORM: RegisterRobotRequest = {
  serialNumber: '',
  brand: 'GAUSIUM',
  model: '',
  name: '',
  customerProfileId: '',
  site: '',
  reportCadence: 'MONTHLY',
};

export function RobotsPanel() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<RegisterRobotRequest>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: robots = [], isLoading, isError } = useQuery({
    queryKey: ['robot-units'],
    queryFn: () => robotUnitApi.list().then((r) => r.data.data ?? []),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerApi.list().then((r) => r.data.data ?? []),
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return robots;
    return robots.filter((r) =>
      [r.serialNumber, r.name, r.brand, r.model, r.deployment?.customerName, r.deployment?.site]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [robots, query]);

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['robot-units'] });
  }

  const registerMutation = useMutation({
    mutationFn: (body: RegisterRobotRequest) => robotUnitApi.register(body).then((r) => r.data),
    onSuccess: () => {
      refresh();
      setAdding(false);
      setForm(EMPTY_FORM);
    },
    onError: (e) => setFormError(errorMessage(e, 'Could not register the robot.')),
  });

  const cadenceMutation = useMutation({
    mutationFn: ({ deploymentId, cadence }: { deploymentId: string; cadence: ReportCadence }) =>
      robotUnitApi.updateCadence(deploymentId, cadence).then((r) => r.data),
    onSuccess: refresh,
  });

  const deactivateMutation = useMutation({
    mutationFn: (deploymentId: string) => robotUnitApi.deactivate(deploymentId).then((r) => r.data),
    onSuccess: refresh,
  });

  function submit() {
    setFormError(null);
    if (!form.serialNumber.trim()) return setFormError('Serial number is required.');
    if (!form.brand?.trim()) return setFormError('Brand is required.');
    if (!form.customerProfileId) return setFormError('Please choose a customer.');
    registerMutation.mutate(form);
  }

  /* ── Register form ─────────────────────────────────────────────────────── */
  if (adding) {
    const field = (key: keyof RegisterRobotRequest, value: string) =>
      setForm((f) => ({ ...f, [key]: value }));

    return (
      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-5">
        <p className="text-sm font-semibold text-[var(--app-text)]">Register robot</p>

        {customers.length === 0 && (
          <p className="mt-3 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            No customers yet — add one in the Customers tab first, then register a robot to them.
          </p>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--app-muted)]">Serial number *</label>
            <input className={inputClass} value={form.serialNumber} onChange={(e) => field('serialNumber', e.target.value)} placeholder="GS401-XXXX-0001" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--app-muted)]">Brand *</label>
            <select className={inputClass} value={form.brand} onChange={(e) => field('brand', e.target.value)}>
              {BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--app-muted)]">Model</label>
            <input className={inputClass} value={form.model ?? ''} onChange={(e) => field('model', e.target.value)} placeholder="Scrubber 50 Pro" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--app-muted)]">Name / label</label>
            <input className={inputClass} value={form.name ?? ''} onChange={(e) => field('name', e.target.value)} placeholder="Lobby scrubber" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--app-muted)]">Customer *</label>
            <select className={inputClass} value={form.customerProfileId} onChange={(e) => field('customerProfileId', e.target.value)}>
              <option value="">Select a customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--app-muted)]">Site / branch</label>
            <input className={inputClass} value={form.site ?? ''} onChange={(e) => field('site', e.target.value)} placeholder="Ground Floor Atrium" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--app-muted)]">Report cadence</label>
            <select className={inputClass} value={form.reportCadence ?? 'MONTHLY'} onChange={(e) => field('reportCadence', e.target.value)}>
              {CADENCES.map((c) => (
                <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {formError && (
          <p className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" /> {formError}
          </p>
        )}

        <div className="mt-5 flex items-center gap-3">
          <Button type="button" onClick={submit} disabled={registerMutation.isPending} className="bg-[var(--app-brand)] text-white hover:opacity-90">
            {registerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Register robot
          </Button>
          <Button
            type="button"
            onClick={() => { setAdding(false); setFormError(null); }}
            disabled={registerMutation.isPending}
            className="border border-[var(--app-border)] bg-[var(--app-panel)] text-[var(--app-text)] hover:border-[var(--app-brand)]"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  /* ── List view ─────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by serial number, robot, or customer…"
            className="h-11 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-panel-alt)] pl-10 pr-3 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-brand)]"
          />
        </div>
        <Button type="button" onClick={() => { setForm(EMPTY_FORM); setFormError(null); setAdding(true); }} className="bg-[var(--app-brand)] text-white hover:opacity-90">
          <Plus className="h-4 w-4" /> Register robot
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 py-8 text-sm text-[var(--app-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading robots…
        </div>
      )}

      {isError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          Could not load robots. Check that you are signed in and the backend is running.
        </p>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-panel)] py-10 text-center text-sm text-[var(--app-muted)]">
          {robots.length === 0 ? 'No robots registered yet. Register your first one.' : 'No robots match your search.'}
        </div>
      )}

      <ul className="space-y-2">
        {filtered.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--app-text)]">
                <Bot className="h-4 w-4 shrink-0 text-[var(--app-brand-dark)]" />
                <span className="truncate">{robotDisplayName(r)}</span>
                <span className="text-xs font-normal text-[var(--app-muted)]">{r.serialNumber}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--app-muted)]">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {r.deployment?.customerName ?? 'Unassigned'}
                </span>
                {r.deployment?.site && (
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{r.deployment.site}</span>
                )}
              </div>
            </div>

            {r.deployment ? (
              <div className="flex items-center gap-2">
                <select
                  aria-label={`Report cadence for ${robotDisplayName(r)}`}
                  value={r.deployment.reportCadence}
                  disabled={cadenceMutation.isPending}
                  onChange={(e) =>
                    cadenceMutation.mutate({ deploymentId: r.deployment!.deploymentId, cadence: e.target.value as ReportCadence })
                  }
                  className="h-9 rounded-lg border border-[var(--app-border)] bg-[var(--app-panel-alt)] px-2 text-xs font-semibold text-[var(--app-text)] outline-none focus:border-[var(--app-brand)]"
                >
                  {CADENCES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Deactivate "${robotDisplayName(r)}" at ${r.deployment?.customerName}? It will stop being reported on.`)) {
                      deactivateMutation.mutate(r.deployment!.deploymentId);
                    }
                  }}
                  disabled={deactivateMutation.isPending}
                  aria-label={`Deactivate ${robotDisplayName(r)}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] text-red-500 transition hover:border-red-400 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <span className="rounded-full border border-[var(--app-border)] px-2.5 py-1 text-xs font-semibold text-[var(--app-muted)]">
                Inactive
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
