/**
 * MonthlyReportView — RAASPAL "Executive Robot Performance Report" one-pager.
 *
 * Brand-agnostic, pure presentational Server Component matching the manager's
 * slide layout: header (customer / site / robot / SN + red "customer needs to
 * know" questions), Part 1 Executive Summary, Part 2 Operational Performance
 * (two SVG ring gauges + task details), Part 3 Consumables Status (traffic-light
 * %), and Recommendations. No client JS, no charting library — rings are SVG so
 * the page prints cleanly and never breaks on a dependency upgrade.
 */
import type {
  MonthlyPerformanceReport,
  HealthState,
  RingMetric,
  ConsumableStatus,
  ExecutiveSummary,
  OperationalPerformance,
} from '@/lib/reports/types';

/* ─── Palette (matches the approved PowerPoint) ──────────────────────────── */

const BLUE_PANEL = '#bcccea'; // section bars + info label cells
const RING_ARC = '#4472c4';
const RING_TRACK = '#dbe4f3';
const DOT: Record<HealthState, string> = {
  good: '#22b04b',
  monitor: '#e0b100',
  action: '#e23b34',
};

/* ─── Building blocks ─────────────────────────────────────────────────────── */

function SectionBar({ part, title }: { part: number; title: string }) {
  return (
    <div className="rounded-sm px-4 py-2 text-lg font-bold text-[#16243a]" style={{ backgroundColor: BLUE_PANEL }}>
      Part {part} : {title}
    </div>
  );
}

/** A 2-row info table with blue label cells (Customer/Site or Robot/SN). */
function InfoTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="overflow-hidden rounded-sm border border-white">
      {rows.map(([label, value]) => (
        <div key={label} className="flex border-b border-white last:border-0">
          <div className="w-32 shrink-0 px-3 py-2 text-sm font-bold text-[#16243a]" style={{ backgroundColor: BLUE_PANEL }}>
            {label}
          </div>
          <div className="flex-1 px-3 py-2 text-sm text-[#16243a]">{value || ' '}</div>
        </div>
      ))}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-4 py-1.5">
      <span className="w-48 shrink-0 text-[#16243a]">{label}</span>
      <span className="font-semibold text-[#16243a]">{value}</span>
    </div>
  );
}

/** SVG donut gauge with the percentage centred. */
function RingGauge({ metric }: { metric: RingMetric }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, metric.percent));
  const dash = (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <p className="mb-2 text-center text-sm font-medium text-[#16243a]">{metric.label}</p>
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke={RING_TRACK} strokeWidth="15" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={RING_ARC}
            strokeWidth="15"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[#16243a]">
          {pct.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="w-36 shrink-0 text-[#16243a]">{label}</span>
      <span className="text-[#16243a]">{value}</span>
    </div>
  );
}

function ConsumableRow({ item }: { item: ConsumableStatus }) {
  return (
    <div className="flex items-center gap-4 py-1.5">
      <span className="w-28 shrink-0 text-[#16243a]">{item.label}</span>
      <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: DOT[item.state] }} aria-hidden />
      <span className="font-semibold text-[#16243a]">{item.percent}%</span>
    </div>
  );
}

/* ─── Sub-sections ────────────────────────────────────────────────────────── */

function ExecutiveSummaryBlock({ s }: { s: ExecutiveSummary }) {
  return (
    <div className="px-2 text-[15px]">
      <SummaryRow label="Total Tasks Completed" value={String(s.totalTasksCompleted)} />
      <SummaryRow label="Total Operating Hours" value={s.totalOperatingTime} />
      <SummaryRow label="Total Area Cleaned" value={`${s.totalAreaCleanedSqm} sqm`} />
      <SummaryRow label="Average Productivity" value={`${s.averageProductivitySqmH} sqm/h`} />
      <SummaryRow label="Water Consumption" value={`${s.waterConsumptionL} L`} />
      <SummaryRow label="Battery Consumption" value={s.batteryConsumption} />
    </div>
  );
}

function OperationalBlock({ o }: { o: OperationalPerformance }) {
  return (
    <div className="px-2">
      <div className="flex flex-wrap justify-center gap-8">
        {o.rings.map((r) => (
          <RingGauge key={r.label} metric={r} />
        ))}
      </div>
      <div className="mt-6 space-y-1.5 text-[15px]">
        <DetailRow label="Task Type" value={o.taskType} />
        <DetailRow label="Task Status" value={o.taskStatus} />
        <DetailRow label="Tasks per Day" value={o.tasksPerDay} />
        <DetailRow label="Average Run Time" value={o.averageRunTime} />
      </div>
    </div>
  );
}

/* ─── Main view ──────────────────────────────────────────────────────────── */

export function MonthlyReportView({ report }: { report: MonthlyPerformanceReport }) {
  return (
    <main className="min-h-dvh bg-[#eef1f6] py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-5xl bg-white px-8 py-7 shadow-sm sm:px-10">
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold leading-tight text-[#16243a] sm:text-[28px]">
              RAASPAL Executive Robot Performance Report
            </h1>
            <p className="mt-1 text-xl font-bold text-[#16243a]">{report.periodLabel}</p>
          </div>

          {/* Red "Customer needs to know" questions */}
          <div className="text-[15px] font-semibold leading-7 text-[#e0202a]">
            <p>Customer needs to know :</p>
            {report.customerQuestions.map((q) => (
              <p key={q}>{q}</p>
            ))}
          </div>
        </div>

        {/* Info boxes: customer/site + robot/SN */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <InfoTable
            rows={[
              ['Customer', report.customerName],
              ['Site / Branch', report.siteBranch],
            ]}
          />
          <InfoTable
            rows={[
              ['Robot Name', report.robotName],
              ['SN No.', report.serialNumber],
            ]}
          />
        </div>

        {/* ── Two-column body ──────────────────────────────────────────────── */}
        <div className="mt-7 grid gap-x-10 gap-y-7 lg:grid-cols-2">
          {/* Left: Part 1 + Part 3 */}
          <div className="space-y-3">
            <SectionBar part={1} title="Executive Summary" />
            <ExecutiveSummaryBlock s={report.executive} />
          </div>

          {/* Right: Part 2 */}
          <div className="space-y-3">
            <SectionBar part={2} title="Operational Performance" />
            <OperationalBlock o={report.operational} />
          </div>

          {/* Left: Part 3 Consumables */}
          <div className="space-y-3">
            <SectionBar part={3} title="Consumables Status" />
            <div className="px-2 text-[15px]">
              {report.consumables.map((c) => (
                <ConsumableRow key={c.label} item={c} />
              ))}
            </div>
          </div>

          {/* Right: Recommendations */}
          <div className="space-y-3">
            <h2 className="px-1 text-lg font-bold text-[#16243a]">Recommendations :</h2>
            {report.recommendations.length > 0 ? (
              <ul className="space-y-2 px-2 text-[15px] text-[#16243a]">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden>•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-4 px-2 pt-2">
                <div className="border-b border-dotted border-[#16243a]" />
                <div className="border-b border-dotted border-[#16243a]" />
              </div>
            )}
          </div>
        </div>

        {/* Footer disclaimer */}
        <p className="mt-8 border-t border-[#dbe4f3] pt-3 text-xs text-[#6b7785]">
          Figures are generated automatically from robot telemetry for the reporting period. Final
          confirmation and any service action require RAASPAL verification and/or an on-site survey.
          © {new Date().getFullYear()} RAASPAL.
        </p>
      </div>
    </main>
  );
}
