/**
 * app/page.tsx — root catch-all redirect
 *
 * In normal flow, proxy.ts intercepts "/" and redirects to "/en" before this
 * page ever renders. This component is a belt-and-suspenders fallback for
 * environments where the proxy is bypassed (e.g. direct static export tests).
 */
import { redirect } from 'next/navigation';

export default function Root() {
  redirect('/en');
}
