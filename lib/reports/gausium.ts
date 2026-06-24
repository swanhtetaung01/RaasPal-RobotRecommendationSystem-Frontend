/**
 * reports/gausium.ts — the Gausium-brand Monthly Performance Report entity.
 *
 * Gausium robots are floor scrubbers, so the Part #4 health components are
 * scrubber consumables (Battery / Brush / Filter / Squeegee / System). Other
 * brands will define their own entity file with their own health components and
 * metrics, all extending `MonthlyPerformanceReport`.
 *
 * `sampleGausiumReport` exists only to preview the page before the backend's
 * public report endpoint is built. It invents no real specs or prices.
 */
import type { MonthlyPerformanceReport } from './types';

/** Gausium-specific monthly report. Brand is pinned to 'GAUSIUM'. */
export interface GausiumMonthlyReport extends MonthlyPerformanceReport {
  brand: 'GAUSIUM';
}

/** Preview data for /[locale]/report/[token] until real data is wired in. */
export const sampleGausiumReport: GausiumMonthlyReport = {
  brand: 'GAUSIUM',
  customerName: 'Central Pattana Co., Ltd.',
  siteBranch: 'CentralWorld — Ground Floor Atrium',
  robotName: 'Gausium Scrubber 50 (SN GS50-2210-0457)',
  periodLabel: 'June 1 – June 30, 2026',
  overallHealth: 'monitor',

  executiveSummary: [
    { icon: 'clock', label: 'Total Operating Hours', value: '182 hrs', hint: 'Across 30 days' },
    { icon: 'tasks', label: 'Total Tasks Completed', value: '1,248', hint: '94% completion rate' },
    { icon: 'area', label: 'Total Area Covered', value: '412,500 m²', hint: 'Cleaned this month' },
    { icon: 'productivity', label: 'Average Productivity', value: '2,267 m²/hr', hint: 'Per operating hour' },
    { icon: 'health', label: 'Overall Robot Health', value: 'Monitor', hint: '1 part needs action' },
  ],

  valueDelivered: [
    { icon: 'area', label: 'Total Area Cleaned', value: '412,500 m²' },
    { icon: 'saved', label: 'Estimated Labor Hours Saved', value: '320 hrs', hint: 'vs. manual cleaning' },
    { icon: 'improvement', label: 'Estimated Productivity Improvement', value: '+18%', hint: 'Month over month' },
    { icon: 'cost', label: 'Estimated Cost Efficiency', value: '฿96,000', hint: 'Estimated labour savings' },
  ],

  performance: [
    { label: 'Utilization Rate', percent: 76 },
    { label: 'Task Completion Rate', percent: 94 },
    { label: 'Average Cleaning Efficiency', percent: 88 },
    { label: 'Battery Performance', percent: 82 },
  ],

  health: [
    { label: 'Battery Status', state: 'good' },
    { label: 'Brush Status', state: 'action', note: 'Wear at 88% — replace soon' },
    { label: 'Filter Status', state: 'good' },
    { label: 'Squeegee Status', state: 'monitor', note: 'Minor streaking detected' },
    { label: 'System Status', state: 'good' },
  ],

  recommendations: [
    { text: 'Schedule brush replacement within 30 days', priority: 'high' },
    { text: 'Increase cleaning schedule during peak traffic periods', priority: 'medium' },
    { text: 'Improve docking station accessibility', priority: 'medium' },
    { text: 'Continue current operation plan', priority: 'info' },
  ],
};
