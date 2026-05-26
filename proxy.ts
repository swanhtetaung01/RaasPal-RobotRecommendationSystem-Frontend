/**
 * proxy.ts  (Next.js 16 — replaces the deprecated middleware.ts)
 *
 * WHY proxy.ts, not middleware.ts?
 * Next.js 16 renamed the file convention from `middleware` to `proxy` to
 * clarify its network-boundary role.  The exported function must be named
 * `proxy` (or be the default export).  The old `middleware` export still
 * works but is deprecated and emits a warning.
 *
 * WHAT it does:
 * next-intl's createMiddleware inspects every incoming request and:
 *   1. Reads the Accept-Language header / locale cookie to detect the user's
 *      preferred locale.
 *   2. If the URL has no locale prefix  (e.g. /)  it redirects to /en.
 *   3. If the URL has a valid prefix it rewrites internally so that
 *      app/[locale]/... receives the correct `params.locale`.
 *   4. Injects the resolved locale into a request header so that
 *      getRequestConfig (i18n/request.ts) can read it server-side.
 */
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Build the handler once at module level (no per-request overhead).
const handleI18nRouting = createMiddleware(routing);

export function proxy(request: Request) {
  // next-intl expects a NextRequest; the runtime type is compatible.
  return handleI18nRouting(request as Parameters<typeof handleI18nRouting>[0]);
}

export const config = {
  /*
   * Run on all routes EXCEPT:
   *  – Next.js internals  (_next/*)
   *  – Static files that have a file extension  (favicon.ico, *.svg, etc.)
   * The negative-lookahead keeps proxy fast: it only fires on real page routes.
   */
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
