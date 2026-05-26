/**
 * i18n/request.ts
 *
 * Called on every server request by the next-intl plugin (wired in next.config.ts).
 * `getRequestConfig` receives the locale that the proxy middleware already resolved
 * from the URL and stored in a header — we just load the matching message file.
 *
 * `requestLocale` is a Promise in next-intl v4 (async params pattern).
 * Fallback to defaultLocale if the segment is somehow missing or invalid.
 */
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the locale coming from the [locale] dynamic segment
  let locale = await requestLocale;

  // Guard: fall back to defaultLocale for unknown values
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
