/**
 * app/[locale]/generate-solution/[solutionType]/upload/page.tsx
 *
 * Step 1 of the MVP flow: Upload a customer survey file.
 * Accepted formats: Excel (.xlsx/.xls), PDF, PNG, JPG.
 *
 * On success the backend:
 *   1. Stores the file and returns a fileId
 *   2. Next step calls extract-from-file to get requirementId
 *   3. Page navigates to /recommendation
 */

import { setRequestLocale } from 'next-intl/server';
import { UploadClient } from './UploadClient';

type Params = {
  params: Promise<{ locale: string; solutionType: string }>;
};

const VALID_TYPES = ['cleaning', 'delivery', 'concierge'] as const;
type SolutionType = (typeof VALID_TYPES)[number];

export function generateStaticParams() {
  return VALID_TYPES.map((solutionType) => ({ solutionType }));
}

const solutionLabels: Record<SolutionType, { title: string; description: string }> = {
  cleaning: {
    title: 'Cleaning Solution',
    description: 'Upload the customer\'s cleaning survey or site assessment document.',
  },
  delivery: {
    title: 'Delivery Solution',
    description: 'Upload the customer\'s delivery workflow or requirements document.',
  },
  concierge: {
    title: 'Concierge Solution',
    description: 'Upload the customer\'s service requirements or concierge brief.',
  },
};

export default async function UploadPage({ params }: Params) {
  const { locale, solutionType } = await params;
  setRequestLocale(locale);

  const meta = solutionLabels[solutionType as SolutionType] ?? solutionLabels.cleaning;

  return <UploadClient locale={locale} meta={meta} solutionType={solutionType} />;
}
