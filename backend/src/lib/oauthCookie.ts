import type { CookieOptions, Response } from 'express';
import { z } from 'zod';

// Temporary cookie that remembers the state and the PKCE codeVerifier between leaving for Google
// and coming back. Only this browser has it, which is what proves the callback was started here
export const OAUTH_COOKIE_NAME = 'google_oauth';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  // Lax IS sent when Google redirects back, because that is a top-level GET navigation
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  // Only sent to /api/auth/google and /api/auth/google/callback, not with every API request
  path: '/api/auth/google',
};

// Enough to choose an account and accept; an abandoned attempt expires on its own
const MAX_AGE_MS = 10 * 60 * 1000;

const oauthCookieSchema = z.object({
  state: z.string().min(1),
  codeVerifier: z.string().min(1),
  // Only when linking Google to an account from /settings: who started it. The callback checks that
  // the same user is still logged in. Missing means a normal sign-in
  linkUserId: z.uuid().optional(),
});

export type OAuthCookie = z.infer<typeof oauthCookieSchema>;

export function setOAuthCookie(res: Response, value: OAuthCookie) {
  // An object is stored as JSON ("j:{...}") and cookie-parser turns it back into an object
  res.cookie(OAUTH_COOKIE_NAME, value, { ...cookieOptions, maxAge: MAX_AGE_MS });
}

// The cookie comes from the browser, so it is validated like any other input. Null if missing or malformed
export function parseOAuthCookie(raw: unknown): OAuthCookie | null {
  const result = oauthCookieSchema.safeParse(raw);
  return result.success ? result.data : null;
}

export function clearOAuthCookie(res: Response) {
  res.clearCookie(OAUTH_COOKIE_NAME, cookieOptions);
}
