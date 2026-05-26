/**
 * app/layout.tsx  — root layout (minimal passthrough)
 *
 * In Next.js 16, when ALL pages live under app/[locale]/, the [locale] layout
 * serves as the effective root layout and owns <html> + <body>, letting us
 * server-render the correct `lang` attribute per locale.
 *
 * This file satisfies the Next.js module graph; globals.css is imported here
 * so the stylesheet is registered once at the root and applies globally.
 */
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // <html> and <body> are provided by app/[locale]/layout.tsx
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return children as any;
}
