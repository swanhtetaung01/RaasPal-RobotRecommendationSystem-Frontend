/**
 * MonthlyReportView — customer-facing Monthly Robot Performance Report.
 *
 * Brand-agnostic, pure presentational Server Component: give it any
 * `MonthlyPerformanceReport` (e.g. a GausiumMonthlyReport) and it renders the
 * branded header info block plus Parts #1–#5. No client-side JS, no charting
 * library — the bar chart is plain CSS so it prints cleanly and never breaks on
 * a dependency upgrade. Colours come from the design tokens in globals.css
 * (brand teal = `primary`; traffic lights = `success` / `warning` / `danger`).
 *
 * Because every brand currently shares this 5-part layout, one shared view
 * renders them all. If a future brand needs a different layout, add a dedicated
 * view and select it by `report.brand`.
 */
import type {
  MonthlyPerformanceReport,
  HealthState,
  ReportKpi,
  PerformanceBar,
  HealthItem,
  Recommendation,
} from '@/lib/reports/types';
import {
  Clock,
  CheckCircle2,
  MapPin,
  Gauge,
  Activity,
  TrendingUp,
  Sparkles,
  ListChecks,
  HeartPulse,
  Wrench,
  CalendarDays,
  Building2,
  Bot,
  ShieldCheck,
} from 'lucide-react';

/* ─── Lookup tables ──────────────────────────────────────────────────────── */

const iconMap = {
  clock: Clock,
  tasks: CheckCircle2,
  area: MapPin,
  productivity: Gauge,
  health: Activity,
  saved: Clock,
  improvement: TrendingUp,
  cost: Sparkles,
} as const;

/** Traffic-light styling per health state (Part #4 + overall badge). */
const HEALTH: Record<HealthState, { label: string; dot: string; text: string; chip: string }> = {
  good: {
    label: 'Good',
    dot: 'bg-success',
    text: 'text-success',
    chip: 'bg-success/10 text-success border-success/30',
  },
  monitor: {
    label: 'Monitor',
    dot: 'bg-warning',
    text: 'text-warning',
    chip: 'bg-warning/10 text-warning border-warning/30',
  },
  action: {
    label: 'Action Required',
    dot: 'bg-danger',
    text: 'text-danger',
    chip: 'bg-danger/10 text-danger border-danger/30',
  },
};

/** Performance-bar colour by threshold (higher = healthier). */
function barColor(percent: number): string {
  if (percent >= 85) return 'bg-success';
  if (percent >= 70) return 'bg-warning';
  return 'bg-danger';
}

const PRIORITY: Record<NonNullable<Recommendation['priority']>, { label: string; chip: string }> = {
  high: { label: 'High', chip: 'bg-danger/10 text-danger border-danger/30' },
  medium: { label: 'Medium', chip: 'bg-warning/10 text-warning border-warning/30' },
  low: { label: 'Low', chip: 'bg-info/10 text-info border-info/30' },
  info: { label: 'Info', chip: 'bg-primary/10 text-primary border-primary/30' },
};

/* ─── Small building blocks ──────────────────────────────────────────────── */

function PartHeader({
  n,
  title,
  question,
  Icon,
}: {
  n: number;
  title: string;
  question: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
        Part #{n}
      </span>
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Icon className="size-5 text-primary" />
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{question}</p>
      </div>
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      {children}
    </section>
  );
}

function KpiCard({ kpi }: { kpi: ReportKpi }) {
  const Icon = iconMap[kpi.icon] ?? Activity;
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-4 text-primary" />
        <span>{kpi.label}</span>
      </div>
      <div className="mt-2 text-2xl font-bold text-foreground">{kpi.value}</div>
      {kpi.hint && <div className="mt-1 text-xs text-muted-foreground">{kpi.hint}</div>}
    </div>
  );
}

function PerfBar({ bar }: { bar: PerformanceBar }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{bar.label}</span>
        <span className="font-semibold text-foreground">{bar.percent}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${barColor(bar.percent)}`}
          style={{ width: `${Math.min(100, Math.max(0, bar.percent))}%` }}
        />
      </div>
    </div>
  );
}

function HealthRow({ item }: { item: HealthItem }) {
  const h = HEALTH[item.state];
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <div className="flex items-center gap-3">
        <span className={`size-3 shrink-0 rounded-full ${h.dot}`} aria-hidden />
        <div>
          <div className="text-sm font-medium text-foreground">{item.label}</div>
          {item.note && <div className="text-xs text-muted-foreground">{item.note}</div>}
        </div>
      </div>
      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${h.chip}`}>
        {h.label}
      </span>
    </div>
  );
}

/* ─── Main view ──────────────────────────────────────────────────────────── */

export function MonthlyReportView({ report }: { report: MonthlyPerformanceReport }) {
  const overall = HEALTH[report.overallHealth];

  return (
    <main className="min-h-dvh bg-background py-8 print:py-0">
      <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6">
        {/* ── Branded header ────────────────────────────────────────────── */}
        <header className="overflow-hidden rounded-2xl bg-aurora text-white shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold uppercase tracking-widest text-white/70">
                  RAASPAL
                </div>
                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                  Monthly Robot Performance Report
                </h1>
              </div>
              <span className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">
                <span className={`size-2.5 rounded-full ${overall.dot}`} aria-hidden />
                {overall.label}
              </span>
            </div>

            {/* Header info block: customer / site / robot / period */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <HeaderField Icon={Building2} label="Customer Name" value={report.customerName} />
              <HeaderField Icon={MapPin} label="Site / Branch" value={report.siteBranch} />
              <HeaderField Icon={Bot} label="Robot Name" value={report.robotName} />
              <HeaderField Icon={CalendarDays} label="Reporting Period" value={report.periodLabel} />
            </div>
          </div>
        </header>

        {/* ── Part #1 — Executive Summary ───────────────────────────────── */}
        <Section>
          <PartHeader n={1} title="Executive Summary" question="What happened this month?" Icon={Activity} />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {report.executiveSummary.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </Section>

        {/* ── Part #2 — Value Delivered ─────────────────────────────────── */}
        <Section>
          <PartHeader n={2} title="Value Delivered" question="What value did the robot create?" Icon={Sparkles} />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {report.valueDelivered.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </Section>

        {/* ── Part #3 — Robot Performance (bar chart) ───────────────────── */}
        <Section>
          <PartHeader n={3} title="Robot Performance" question="How well did the robot perform?" Icon={Gauge} />
          <div className="space-y-4">
            {report.performance.map((bar) => (
              <PerfBar key={bar.label} bar={bar} />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <LegendDot className="bg-success" label="Strong (≥85%)" />
            <LegendDot className="bg-warning" label="Moderate (70–84%)" />
            <LegendDot className="bg-danger" label="Needs attention (<70%)" />
          </div>
        </Section>

        {/* ── Part #4 — Robot Health Status (traffic light) ─────────────── */}
        <Section>
          <PartHeader n={4} title="Robot Health Status" question="Is the robot healthy?" Icon={HeartPulse} />
          <div className="rounded-xl border border-border bg-background px-4">
            {report.health.map((item) => (
              <HealthRow key={item.label} item={item} />
            ))}
          </div>
          {/* Traffic-light legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <LegendDot className="bg-success" label="Good" />
            <LegendDot className="bg-warning" label="Monitor" />
            <LegendDot className="bg-danger" label="Action Required" />
          </div>
        </Section>

        {/* ── Part #5 — Recommendations & Next Actions ──────────────────── */}
        <Section>
          <PartHeader n={5} title="Recommendations & Next Actions" question="What should be done next?" Icon={ListChecks} />
          <ul className="space-y-3">
            {report.recommendations.map((rec, i) => {
              const p = PRIORITY[rec.priority ?? 'info'];
              return (
                <li key={i} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
                  <Wrench className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="flex-1 text-sm text-foreground">{rec.text}</span>
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${p.chip}`}>
                    {p.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </Section>

        {/* ── Footer / disclaimer ───────────────────────────────────────── */}
        <footer className="flex items-start gap-2 px-1 pb-4 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            Figures are generated automatically from robot telemetry for the reporting period.
            Final solution confirmation and any service action require RAASPAL verification
            and/or an on-site survey. © {new Date().getFullYear()} RAASPAL.
          </p>
        </footer>
      </div>
    </main>
  );
}

/* ─── Header field + legend helpers ──────────────────────────────────────── */

function HeaderField({
  Icon,
  label,
  value,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-white/10 p-3 backdrop-blur">
      <Icon className="mt-0.5 size-5 shrink-0 text-white/80" />
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wide text-white/70">{label}</div>
        <div className="truncate text-sm font-semibold text-white" title={value}>
          {value}
        </div>
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <span className={`size-2.5 rounded-full ${className}`} aria-hidden />
      {label}
    </span>
  );
}
