import { AppError } from '../lib/appError.js';
import { createGoogleAuthorization, getGoogleProfile } from '../lib/google.js';
import type { OAuthCookie } from '../lib/oauthCookie.js';
import { signSessionToken } from '../lib/jwt.js';
import { DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from '../lib/password.js';
import { DEFAULT_CATEGORIES } from '../constants/defaultCategories.js';
import * as authAccountRepository from '../repositories/authAccount.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import type { LoginInput, RegisterInput, UpdateProfileInput } from '../schemas/auth.schema.js';

export async function register(input: RegisterInput) {
  if (await userRepository.existsByEmail(input.email)) {
    throw new AppError(409, 'Email is already registered');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await userRepository.createWithCategories(
    { email: input.email, name: input.name, passwordHash },
    DEFAULT_CATEGORIES,
  );

  return { user, token: signSessionToken(user.id) };
}

export async function login(input: LoginInput) {
  const found = await userRepository.findWithPasswordByEmail(input.email);

  // bcrypt runs even if the email does not exist or the user has no password (signed up with Google),
  // so every case takes the same time. Nobody knows the value behind the dummy hash, so it never matches
  const passwordMatches = await verifyPassword(input.password, found?.passwordHash ?? DUMMY_PASSWORD_HASH);

  // Same message for "unknown email", "wrong password" and "no password": it does not reveal which
  // emails exist or how each account signs in
  if (!found || !passwordMatches) {
    throw new AppError(401, 'Invalid email or password');
  }

  // Rest syntax: `user` gets every field except passwordHash
  const { passwordHash: _passwordHash, ...user } = found;
  return { user, token: signSessionToken(user.id) };
}

// ---- Sign in with Google (OAuth 2.0 + OpenID Connect, with PKCE) ----

// Step 1: the Google URL to redirect to, and the state and codeVerifier the controller keeps in a cookie
export function startGoogleSignIn() {
  return createGoogleAuthorization();
}

// Why a Google sign-in did not end in a session. The controller turns it into /login?error=<reason>
export type GoogleSignInFailure =
  | 'google_cancelled' // The user pressed "Cancel" on Google's screen
  | 'google_failed' // Missing or mismatched state, or Google rejected the code: try again
  | 'email_not_verified' // Google does not vouch for the email, so no account is created with it
  | 'account_exists'; // That email already has an account (it is never linked automatically)

// Expected outcomes are returned, not thrown: this endpoint answers a browser navigation with a
// redirect, never with a JSON error
export type GoogleSignInResult = { ok: true; token: string } | { ok: false; reason: GoogleSignInFailure };

interface GoogleCallbackParams {
  code?: string | undefined;
  state?: string | undefined;
  error?: string | undefined;
}

const NAME_MAX_LENGTH = 50; // Same limit as the register form

// Step 2, when Google sends the user back. `saved` is what step 1 left in the cookie (null if missing)
export async function finishGoogleSignIn(
  params: GoogleCallbackParams,
  saved: OAuthCookie | null,
): Promise<GoogleSignInResult> {
  if (params.error === 'access_denied') return { ok: false, reason: 'google_cancelled' };

  // The state must be the one this browser stored before leaving. Otherwise someone else started this
  // sign-in (e.g. a link that would log the victim into the attacker's account) or the cookie expired
  if (params.error || !params.code || !saved || params.state !== saved.state) {
    return { ok: false, reason: 'google_failed' };
  }

  const profile = await getGoogleProfile(params.code, saved.codeVerifier);
  if (!profile) return { ok: false, reason: 'google_failed' };

  // Already linked: always looked up by Google's permanent id, never by email
  const linked = await authAccountRepository.findByProviderAccount('GOOGLE', profile.googleId);
  if (linked) return { ok: true, token: signSessionToken(linked.userId) };

  if (!profile.emailVerified) return { ok: false, reason: 'email_not_verified' };

  // The email belongs to an existing account. Linking it here would let whoever registered that
  // email (our register does not verify emails) into the Google user's data later
  // ("pre-account hijacking"). The owner links Google from /settings, after signing in
  if (await userRepository.existsByEmail(profile.email)) return { ok: false, reason: 'account_exists' };

  // New user: no password, the Google link and the default categories, all in one transaction.
  // Without a name in Google, the part of the email before the "@"
  const name = (profile.name?.trim() || profile.email.slice(0, profile.email.indexOf('@'))).slice(0, NAME_MAX_LENGTH);
  const user = await userRepository.createWithCategories({ email: profile.email, name }, DEFAULT_CATEGORIES, {
    provider: 'GOOGLE',
    providerAccountId: profile.googleId,
  });
  return { ok: true, token: signSessionToken(user.id) };
}

export async function getCurrentUser(userId: string) {
  const user = await userRepository.findPublicById(userId);
  // The token is valid but the user was deleted: treat it as not logged in
  if (!user) {
    throw new AppError(401, 'Not authenticated');
  }
  return user;
}

// Changing the currency only changes how amounts are shown: they are stored in cents and never converted
export async function updateProfile(userId: string, input: UpdateProfileInput) {
  // Same check as getCurrentUser: without it, a deleted user would make Prisma's update fail with a 500
  await getCurrentUser(userId);
  return userRepository.updateProfile(userId, input);
}
