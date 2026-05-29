/**
 * app/api/auth/session/route.ts
 *
 * Sets / clears the httpOnly `raaspal_token` cookie so that proxy.ts can
 * verify auth status on every SSR request without touching localStorage.
 *
 * POST /api/auth/session  { token: string }  — set the cookie
 * DELETE /api/auth/session                    — clear the cookie (logout)
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const COOKIE_NAME = 'raaspal_token';

/** POST — store the JWT as an httpOnly cookie */
export async function POST(request: Request) {
  const { token } = (await request.json()) as { token: string };

  if (!token) {
    return NextResponse.json({ success: false, message: 'Token is required' }, { status: 400 });
  }

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // Expire in 24 hours (matches backend refresh-expiration-ms default)
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json({ success: true });
}

/** DELETE — remove the cookie on logout */
export async function DELETE() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  return NextResponse.json({ success: true });
}
