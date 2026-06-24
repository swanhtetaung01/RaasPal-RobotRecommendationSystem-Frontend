/**
 * reports/preview.ts — build a report for the internal format-preview tool.
 *
 * For confirming the report LAYOUT with the manager before live telemetry is
 * wired: we keep the representative sample metrics but swap in a real robot's
 * header (customer, site, robot, SN) and a chosen period. The numbers are
 * placeholders; the structure is exactly what customers will see.
 */
import { sampleGausiumReport } from './gausium';
import type { MonthlyPerformanceReport } from './types';

/** Overrides applied on top of the sample report for the preview. */
export interface PreviewHeader {
  customerName: string;
  siteBranch: string;
  robotName: string;
  serialNumber: string;
  periodLabel: string;
}

/** Merge a real robot's header onto the sample metrics. */
export function buildPreviewReport(header: PreviewHeader): MonthlyPerformanceReport {
  return { ...sampleGausiumReport, ...header };
}

/** "2026-06" → "June 2026" for the report title period. */
export function monthYearLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month) return yearMonth;
  const monthName = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' });
  return `${monthName} ${year}`;
}
