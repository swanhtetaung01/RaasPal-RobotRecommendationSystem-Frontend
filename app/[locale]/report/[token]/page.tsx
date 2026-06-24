/**
 * /[locale]/report/[token] — public, customer-facing monthly report page.
 *
 * Reached from the link in the customer's monthly email. It is PUBLIC (no login)
 * — `/report` is whitelisted in proxy.ts — because customers don't have accounts.
 * The `token` is an unguessable id that will key the real data fetch:
 *
 *   const report = await fetchPublicReport(token); // GET /api/v1/reports/public/{token}
 *
 * Until that backend endpoint exists, we render brand-specific sample data so the
 * layout can be previewed at /en/report/demo. The view is brand-agnostic; pick
 * the sample/entity by brand once multiple brands report.
 */
import { MonthlyReportView } from '@/components/report/MonthlyReportView';
import { sampleGausiumReport } from '@/lib/reports/gausium';

export default async function ReportPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  // token will select the real report; unused while previewing sample data.
  const { token } = await params;
  void token;

  return <MonthlyReportView report={sampleGausiumReport} />;
}
