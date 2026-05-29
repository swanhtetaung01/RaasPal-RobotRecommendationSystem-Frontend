/**
 * app/[locale]/generate-solution/[solutionType]/proposal/page.tsx
 *
 * Step 3 of the MVP flow: Generate and display the customer proposal.
 *
 * URL: /[locale]/generate-solution/[solutionType]/proposal?recId=<uuid>&robotId=<uuid>
 * - Calls POST /api/v1/proposals/generate { recommendationId, selectedRobotId }
 * - Displays the generated proposal content
 * - Provides a print / copy action
 */

import { setRequestLocale } from 'next-intl/server';
import { ProposalClient } from './ProposalClient';

type Params = {
  params: Promise<{ locale: string; solutionType: string }>;
};

export default async function ProposalPage({ params }: Params) {
  const { locale, solutionType } = await params;
  setRequestLocale(locale);

  return <ProposalClient locale={locale} solutionType={solutionType} />;
}
