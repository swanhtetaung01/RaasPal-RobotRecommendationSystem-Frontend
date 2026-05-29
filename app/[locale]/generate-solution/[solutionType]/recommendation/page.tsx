/**
 * app/[locale]/generate-solution/[solutionType]/recommendation/page.tsx
 *
 * Step 2 of the MVP flow: Generate and display robot recommendations.
 *
 * URL: /[locale]/generate-solution/[solutionType]/recommendation?reqId=<uuid>
 * - Reads `reqId` from the query string (set by the upload page)
 * - Calls POST /api/v1/recommendations/generate/{requirementId}
 * - Displays 2–3 ranked robot options
 * - User selects one → navigate to proposal page
 */

import { setRequestLocale } from 'next-intl/server';
import { RecommendationClient } from './RecommendationClient';

type Params = {
  params: Promise<{ locale: string; solutionType: string }>;
};

export default async function RecommendationPage({ params }: Params) {
  const { locale, solutionType } = await params;
  setRequestLocale(locale);

  return <RecommendationClient locale={locale} solutionType={solutionType} />;
}
