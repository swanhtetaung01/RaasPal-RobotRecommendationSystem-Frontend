/**
 * UploadClient.tsx
 * Client component — handles drag-and-drop + click-to-upload survey file.
 *
 * Flow:
 *   1. User drops / selects file
 *   2. POST /api/v1/files/upload       → fileId
 *   3. POST /api/v1/requirements/extract-from-file/{fileId}  → requirementId
 *   4. Navigate to /recommendation?reqId=...
 */

'use client';

import { useCallback, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { fileApi, requirementApi } from '@/lib/api';
import type { RobotType } from '@/types/api';
import { AppSidebar } from '@/components/AppSidebar';
import { AppTopBar } from '@/components/AppTopBar';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Loader2,
  UploadCloud,
  X,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';

const ROBOT_TYPE_MAP: Record<string, RobotType> = {
  cleaning: 'CLEANING',
  delivery: 'DELIVERY',
  mowing: 'MOWING',
};

const ACCEPT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'image/png',
  'image/jpeg',
];

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
  if (type.includes('sheet') || type.includes('excel'))
    return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
  return <FileText className="h-5 w-5 text-red-500" />;
}

interface UploadClientProps {
  locale: string;
  solutionType: string;
  meta: { title: string; description: string };
}

type Stage = 'idle' | 'uploading' | 'extracting' | 'done' | 'error';

export function UploadClient({ locale, solutionType, meta }: UploadClientProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const robotType: RobotType = ROBOT_TYPE_MAP[solutionType] ?? 'CLEANING';

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped && ACCEPT_TYPES.includes(dropped.type)) {
      setFile(dropped);
      setErrorMsg(null);
    } else {
      setErrorMsg('Unsupported file type. Please upload PDF, Excel, PNG, or JPG.');
    }
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) {
      setFile(selected);
      setErrorMsg(null);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    setStage('uploading');
    setErrorMsg(null);

    try {
      // Step 1: Upload file
      const uploadRes = await fileApi.upload(file);
      if (!uploadRes.data.success) {
        throw new Error(uploadRes.data.message ?? 'File upload failed');
      }
      const { id: fileId } = uploadRes.data.data;

      // Step 2: Extract requirements from file
      setStage('extracting');
      const extractRes = await requirementApi.extractFromFile(fileId, robotType);
      if (!extractRes.data.success) {
        throw new Error(extractRes.data.message ?? 'Requirement extraction failed');
      }
      const { id: requirementId } = extractRes.data.data;

      setStage('done');

      // Step 3: Navigate to recommendation page
      setTimeout(() => {
        router.push(
          `/generate-solution/${solutionType}/recommendation?reqId=${requirementId}`,
          { locale } as Parameters<typeof router.push>[1],
        );
      }, 800);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as Error)?.message ??
        'Something went wrong';
      setErrorMsg(msg);
      setStage('error');
    }
  }, [file, robotType, solutionType, locale, router]);

  const stageLabel: Record<Stage, string> = {
    idle: 'Generate recommendations',
    uploading: 'Uploading file…',
    extracting: 'Extracting requirements…',
    done: 'Done! Redirecting…',
    error: 'Retry',
  };

  return (
    <main className="min-h-dvh bg-[var(--app-bg)] text-[var(--app-text)] transition-colors">
      <div className="flex min-h-dvh">
        <AppSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <AppTopBar
            eyebrow="Generate solution · Upload"
            searchPlaceholder="Search customers, sites, robot criteria"
            title={meta.title}
          />

          <div className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-6">
            {/* Back link */}
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--app-muted)] hover:text-[var(--app-brand-dark)]"
              href={`/generate-solution/${solutionType}`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to solution types
            </Link>

            {/* Header */}
            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-hero)] p-6 text-white shadow-sm">
              <p className="text-sm font-semibold uppercase text-cyan-100">Step 1 of 3 · Upload survey</p>
              <h2 className="mt-2 text-2xl font-bold">{meta.title}</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-white/70">{meta.description}</p>
            </div>

            {/* Drop zone */}
            <div
              className={`relative cursor-pointer rounded-xl border-2 border-dashed transition ${
                dragOver
                  ? 'border-[var(--app-brand)] bg-[var(--app-brand-soft)]'
                  : 'border-[var(--app-border)] bg-[var(--app-panel)] hover:border-[var(--app-brand)]'
              }`}
              onClick={() => document.getElementById('file-input')?.click()}
              onDragLeave={() => setDragOver(false)}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDrop={handleDrop}
            >
              <input
                accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg"
                className="sr-only"
                id="file-input"
                onChange={handleFileChange}
                type="file"
              />

              <div className="flex flex-col items-center gap-4 p-10">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--app-brand-soft)] text-[var(--app-brand-dark)]">
                  <UploadCloud className="h-8 w-8" />
                </span>
                <div className="text-center">
                  <p className="font-semibold text-[var(--app-text)]">
                    Drop file here or <span className="text-[var(--app-brand-dark)] underline">browse</span>
                  </p>
                  <p className="mt-1 text-sm text-[var(--app-muted)]">
                    PDF, Excel (.xlsx / .xls), PNG, JPG · Max 20 MB
                  </p>
                </div>
              </div>
            </div>

            {/* Selected file */}
            {file && (
              <div className="flex items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] px-4 py-3">
                <FileIcon type={file.type} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--app-text)]">{file.name}</p>
                  <p className="text-xs text-[var(--app-muted)]">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                {stage === 'done' && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />}
                {stage === 'idle' || stage === 'error' ? (
                  <button
                    aria-label="Remove file"
                    className="rounded-lg p-1 text-[var(--app-muted)] hover:bg-[var(--app-faint)] hover:text-[var(--app-text)]"
                    onClick={(e) => { e.stopPropagation(); setFile(null); setErrorMsg(null); setStage('idle'); }}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            )}

            {/* Progress indicator */}
            {(stage === 'uploading' || stage === 'extracting') && (
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-4">
                <div className="flex items-center gap-3 text-sm">
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--app-brand)]" />
                  <span className="font-semibold text-[var(--app-text)]">
                    {stage === 'uploading' ? 'Uploading file to RAAS PAL…' : 'AI is extracting customer requirements…'}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--app-border)]">
                  <div
                    className="h-full rounded-full bg-[var(--app-brand)] transition-all duration-500"
                    style={{ width: stage === 'uploading' ? '40%' : '80%' }}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            {/* Submit */}
            <Button
              className="w-full bg-[var(--app-brand)] font-semibold text-white hover:bg-[var(--app-brand-dark)] disabled:opacity-50"
              disabled={!file || stage === 'uploading' || stage === 'extracting' || stage === 'done'}
              onClick={handleSubmit}
              size="lg"
              type="button"
            >
              {stage === 'uploading' || stage === 'extracting' || stage === 'done' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {stageLabel[stage]}
                </>
              ) : (
                stageLabel[stage]
              )}
            </Button>

            {/* Disclaimer */}
            <p className="text-center text-xs text-[var(--app-muted)]">
              AI extraction requires RAASPAL verification before the proposal is sent to the customer.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
