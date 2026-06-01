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

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { UploadClient } from './UploadClient';

type Params = {
  params: Promise<{ locale: string; solutionType: string }>;
};

const VALID_TYPES = ['cleaning', 'delivery', 'mowing'] as const;
type SolutionType = (typeof VALID_TYPES)[number];

export function generateStaticParams() {
  return VALID_TYPES.map((solutionType) => ({ solutionType }));
}

export default async function UploadPage({ params }: Params) {
  const { locale, solutionType } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'generateSolution.forms' });
  const type = VALID_TYPES.includes(solutionType as SolutionType)
    ? (solutionType as SolutionType)
    : 'cleaning';

  const meta = {
    title: t(`${type}.title`),
    description: t(`${type}.description`),
  };

  return <UploadClient locale={locale} meta={meta} solutionType={solutionType} />;
}
