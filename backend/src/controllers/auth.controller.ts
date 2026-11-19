import type { RequestHandler } from 'express';
import * as authService from '../services/auth.service.js';
import { APP_URL } from '../lib/appUrl.js';
import { clearOAuthCookie, OAUTH_COOKIE_NAME, parseOAuthCookie, setOAuthCookie } from '../lib/oauthCookie.js';
import { clearSessionCookie, readSessionUserId, setSessionCookie } from '../lib/sessionCookie.js';
import {
  googleCallbackQuerySchema,
  type LoginInput,
  type RegisterInput,
  type SetPasswordInput,
  type UpdateProfileInput,
} from '../schemas/auth.schema.js';

type NoParams = Record<string, string>;

// The token only travels in the httpOnly cookie, never in the JSON body:
// that way the frontend's JavaScript never touches it
export const register: RequestHandler<NoParams, unknown, RegisterInput> = async (req, res) => {
  const { user, token } = await authService.register(req.body);
  setSessionCookie(res, token);
  res.status(201).json(user);
};

export const login: RequestHandler<NoParams, unknown, LoginInput> = async (req, res) => {
  const { user, token } = await authService.login(req.body);
  setSessionCookie(res, token);
  res.json(user);
};

// A JWT cannot be revoked on the server: logging out means deleting the cookie in the browser
export const logout: RequestHandler = (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
};

// ---- Sign in with Google. These are browser navigations, not fetch calls: they always answer with
// a redirect, and errors go in the URL (?error=… / ?google_error=…) for the frontend to show ----

// GET /auth/google: keeps state and codeVerifier in the temporary cookie and sends the user to Google
export const startGoogle: RequestHandler = (_req, res) => {
  const { url, state, codeVerifier } = authService.startGoogleSignIn();
  setOAuthCookie(res, { state, codeVerifier });
  res.redirect(url.toString());
};

// GET /auth/google/link (logged in): the same, but the callback will link Google to this account
export const startGoogleLink: RequestHandler = (req, res) => {
  const { url, state, codeVerifier, linkUserId } = authService.startGoogleLink(req.userId);
  setOAuthCookie(res, { state, codeVerifier, linkUserId });
  res.redirect(url.toString());
};

// GET /auth/google/callback: Google sends the user back here, both when signing in and when linking
export const googleCallback: RequestHandler = async (req, res) => {
  const saved = parseOAuthCookie(req.cookies?.[OAUTH_COOKIE_NAME]);
  // Single use, whatever happens next: a used state must never be accepted again
  clearOAuthCookie(res);

  // Validated here and not with the validate middleware: that one answers 400 with JSON, and this
  // request comes from a browser navigation. Unknown or malformed values count as a failed attempt
  const query = googleCallbackQuerySchema.safeParse(req.query);
  const params = query.success ? query.data : { error: 'invalid_query' };

  if (saved?.linkUserId) {
    const result = await authService.finishGoogleLink(params, saved, readSessionUserId(req.cookies));
    res.redirect(`${APP_URL}/settings?${result.ok ? 'google=linked' : `google_error=${result.reason}`}`);
    return;
  }

  const result = await authService.finishGoogleSignIn(params, saved);
  if (!result.ok) {
    res.redirect(`${APP_URL}/login?error=${result.reason}`);
    return;
  }

  setSessionCookie(res, result.token);
  res.redirect(`${APP_URL}/dashboard`);
};

// ---- Sign-in methods (/settings) ----

export const methods: RequestHandler = async (req, res) => {
  res.json(await authService.getAuthMethods(req.userId));
};

export const unlinkGoogle: RequestHandler = async (req, res) => {
  await authService.unlinkProvider(req.userId, 'GOOGLE');
  res.status(204).end();
};

export const setPassword: RequestHandler<NoParams, unknown, SetPasswordInput> = async (req, res) => {
  await authService.setPassword(req.userId, req.body.password);
  res.status(204).end();
};

export const me: RequestHandler = async (req, res) => {
  res.json(await authService.getCurrentUser(req.userId));
};

export const updateMe: RequestHandler<NoParams, unknown, UpdateProfileInput> = async (req, res) => {
  res.json(await authService.updateProfile(req.userId, req.body));
};
