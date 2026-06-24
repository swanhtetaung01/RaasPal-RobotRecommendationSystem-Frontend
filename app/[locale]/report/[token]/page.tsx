/**
 * /[locale]/report/[token] — public, customer-facing monthly report page.
 *
 * PUBLIC (no login) — `/report` is whitelisted in proxy.ts, and the backend
 * `/api/v1/reports/public/{token}` endpoint is whitelisted in SecurityConfig.
 * This is the SAME URL the customer's monthly email links to. The page is
 * close-only: there is no in-app navigation, just the report + a language
 * switcher. Token "example" renders the sample layout.
 */
import { setRequestLocale } from 'next-intl/server';
import { PublicReportClient } from './PublicReportClient';

export default async function ReportPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale); // prime locale so report labels translate

  return <PublicReportClient token={token} />;
}
