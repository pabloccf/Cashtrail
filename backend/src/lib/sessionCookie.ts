import type { CookieOptions, Response } from 'express';
import { SESSION_DURATION_SECONDS, verifySessionToken } from './jwt.js';

export const SESSION_COOKIE_NAME = 'session';

const cookieOptions: CookieOptions = {
  httpOnly: true, // JavaScript in the browser cannot read it, so an XSS cannot steal the token
  sameSite: 'lax', // Not sent on requests started by other sites (except top-level navigation)
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  path: '/',
};

export function setSessionCookie(res: Response, token: string) {
  // maxAge is in milliseconds; it matches the JWT expiration
  res.cookie(SESSION_COOKIE_NAME, token, { ...cookieOptions, maxAge: SESSION_DURATION_SECONDS * 1000 });
}

// The browser only deletes the cookie if the options (path, sameSite...) match the ones used to set it
export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, cookieOptions);
}

// The logged-in user's id from the session cookie (as parsed by cookie-parser), or null if there is
// no valid session. Used by requireAuth and by the Google callback when linking an account
export function readSessionUserId(cookies: Record<string, unknown> | undefined): string | null {
  const token = cookies?.[SESSION_COOKIE_NAME];
  return typeof token === 'string' ? verifySessionToken(token) : null;
}
