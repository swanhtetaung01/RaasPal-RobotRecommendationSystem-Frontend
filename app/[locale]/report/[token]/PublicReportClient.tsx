'use client';

/**
 * PublicReportClient — renders the public report for a shared token.
 *
 * Standalone, close-only page (no in-app navigation): the customer opens the
 * link, reads the report, and closes the tab. A language switcher is the only
 * control. Token "example" shows the sample layout; any other token fetches the
 * real aggregated report from the public (no-auth) endpoint.
 */
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { reportApi } from '@/lib/api';
import { MonthlyReportView } from '@/components/report/MonthlyReportView';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { sampleGausiumReport } from '@/lib/reports/gausium';

export function PublicReportClient({ token }: { token: string }) {
  const isExample = token === 'example';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-report', token],
    queryFn: () => reportApi.publicReport(token).then((r) => r.data.data),
    enabled: !isExample,
  });

  const report = isExample ? sampleGausiumReport : data;

  return (
    <div className="min-h-dvh bg-[#eef1f6]">
      <div className="mx-auto flex max-w-5xl justify-end px-4 pt-4 sm:px-6">
        <LanguageSwitcher />
      </div>

      {!isExample && isLoading && (
        <div className="flex items-center justify-center gap-2 py-32 text-sm text-[#6b7785]">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading report…
        </div>
      )}

      {!isExample && isError && (
        <div className="mx-auto max-w-md px-6 py-32 text-center">
          <p className="text-lg font-semibold text-[#16243a]">Report not available</p>
          <p className="mt-2 text-sm text-[#6b7785]">
            This report link is invalid or has expired. Please request a new link.
          </p>
        </div>
      )}

      {report && <MonthlyReportView report={report} />}
    </div>
  );
}
