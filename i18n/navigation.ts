/**
 * i18n/navigation.ts
 *
 * `createNavigation` returns typed versions of Next.js's Link, useRouter,
 * usePathname and redirect that are locale-aware.
 *
 * Import FROM HERE instead of 'next/navigation' or 'next/link' anywhere you
 * need locale-switching behaviour — e.g. the LanguageSwitcher uses useRouter
 * from here so it can pass `{ locale: 'th' }` and Next.js rewrites the URL
 * prefix automatically while keeping the rest of the pathname intact.
 */
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const {
  Link,
  redirect,
  usePathname,
  useRouter,
  getPathname,
} = createNavigation(routing);
