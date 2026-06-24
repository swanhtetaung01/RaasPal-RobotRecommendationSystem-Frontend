/**
 * reports/types.ts — shared report primitives and the base report contract.
 *
 * These types are brand-agnostic: every brand's monthly report reuses the same
 * UI building blocks (KPIs, performance bars, traffic-light health rows,
 * recommendations) and the same 5-part layout. Brand-specific report ENTITIES
 * (e.g. `GausiumMonthlyReport` in ./gausium.ts) extend `MonthlyPerformanceReport`
 * and set their own `brand` discriminator, mirroring the backend's
 * ReportGenerator-by-brand adapter pattern.
 *
 * To add a brand later: create reports/<brand>.ts exporting a typed entity that
 * `extends MonthlyPerformanceReport`, and (only if its layout differs) a
 * dedicated view. If the layout matches, the shared MonthlyReportView renders it.
 */

/** Robot brands that can produce a monthly report. Extend as the catalog grows. */
export type RobotBrand = 'GAUSIUM' | 'KEENON' | 'CENOBOT';

/** Traffic-light health state used in Part #4 and the overall badge. */
export type HealthState = 'good' | 'monitor' | 'action';

/** A single headline figure shown as a card (Parts #1 and #2). */
export interface ReportKpi {
  /** Maps to a small icon in the view; see `iconMap` in MonthlyReportView. */
  icon: 'clock' | 'tasks' | 'area' | 'productivity' | 'health' | 'saved' | 'improvement' | 'cost';
  label: string;
  /** Pre-formatted display value, e.g. "182 hrs" or "+18%". */
  value: string;
  /** Optional sub-line under the value. */
  hint?: string;
}

/** A single horizontal bar in the Part #3 performance chart (percent 0–100). */
export interface PerformanceBar {
  label: string;
  percent: number;
}

/** One row in the Part #4 robot health table. */
export interface HealthItem {
  label: string;
  state: HealthState;
  /** Optional short note, e.g. "Wear at 88%". */
  note?: string;
}

/** One line in the Part #5 recommendations list. */
export interface Recommendation {
  text: string;
  /** Drives the marker colour/label; defaults to "info". */
  priority?: 'high' | 'medium' | 'low' | 'info';
}

/**
 * Base monthly report contract shared by all brands. A brand-specific entity
 * narrows `brand` to a single literal (e.g. `brand: 'GAUSIUM'`) and may add
 * brand-only fields. The shared MonthlyReportView accepts this base type.
 */
export interface MonthlyPerformanceReport {
  /** Discriminator so a registry/view can tell brands apart. */
  brand: RobotBrand;
  customerName: string;
  siteBranch: string;
  robotName: string;
  /** Human-readable period, e.g. "June 1 – June 30, 2026". */
  periodLabel: string;
  /** Overall health shown as a badge in the header. */
  overallHealth: HealthState;
  /** Part #1 — Executive Summary ("What happened this month?"). */
  executiveSummary: ReportKpi[];
  /** Part #2 — Value Delivered ("What value did the robot create?"). */
  valueDelivered: ReportKpi[];
  /** Part #3 — Robot Performance ("How well did the robot perform?"). */
  performance: PerformanceBar[];
  /** Part #4 — Robot Health Status ("Is the robot healthy?"). */
  health: HealthItem[];
  /** Part #5 — Recommendations & Next Actions ("What should be done next?"). */
  recommendations: Recommendation[];
}
