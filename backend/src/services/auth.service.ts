import { AppError } from '../lib/appError.js';
import { createGoogleAuthorization, getGoogleProfile, type GoogleProfile } from '../lib/google.js';
import type { OAuthCookie } from '../lib/oauthCookie.js';
import { signSessionToken } from '../lib/jwt.js';
import { DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from '../lib/password.js';
import { DEFAULT_CATEGORIES } from '../constants/defaultCategories.js';
import type { AuthProvider } from '../generated/prisma/enums.js';
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

// Same as startGoogleSignIn, but remembering who is linking: the callback links instead of signing in
export function startGoogleLink(userId: string) {
  return { ...createGoogleAuthorization(), linkUserId: userId };
}

interface GoogleCallbackParams {
  code?: string | undefined;
  state?: string | undefined;
  error?: string | undefined;
}

// Failures shared by sign-in and linking
type GoogleCallbackFailure =
  | 'google_cancelled' // The user pressed "Cancel" on Google's screen
  | 'google_failed'; // Missing or mismatched state, or Google rejected the code: try again

// Expected outcomes are returned, not thrown: the callback answers a browser navigation with a
// redirect, never with a JSON error
type Failure<Reason> = { ok: false; reason: Reason };

// Step 2, common part: checks the state and exchanges the code for who the person is in Google.
// `saved` is what step 1 left in the cookie (null if missing or expired)
async function verifyGoogleCallback(
  params: GoogleCallbackParams,
  saved: OAuthCookie | null,
): Promise<{ ok: true; profile: GoogleProfile } | Failure<GoogleCallbackFailure>> {
  if (params.error === 'access_denied') return { ok: false, reason: 'google_cancelled' };

  // The state must be the one this browser stored before leaving. Otherwise someone else started this
  // flow (e.g. a link that would log the victim into the attacker's account) or the cookie expired
  if (params.error || !params.code || !saved || params.state !== saved.state) {
    return { ok: false, reason: 'google_failed' };
  }

  const profile = await getGoogleProfile(params.code, saved.codeVerifier);
  return profile ? { ok: true, profile } : { ok: false, reason: 'google_failed' };
}

// Why a Google sign-in did not end in a session. The controller turns it into /login?error=<reason>
export type GoogleSignInFailure =
  | GoogleCallbackFailure
  | 'email_not_verified' // Google does not vouch for the email, so no account is created with it
  | 'account_exists'; // That email already has an account (it is never linked automatically)

const NAME_MAX_LENGTH = 50; // Same limit as the register form

export async function finishGoogleSignIn(
  params: GoogleCallbackParams,
  saved: OAuthCookie | null,
): Promise<{ ok: true; token: string } | Failure<GoogleSignInFailure>> {
  const verified = await verifyGoogleCallback(params, saved);
  if (!verified.ok) return verified;
  const { profile } = verified;

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

// Why linking Google from /settings failed. The controller turns it into /settings?google_error=<reason>
export type GoogleLinkFailure =
  | GoogleCallbackFailure
  | 'google_in_use' // That Google account is already linked to another Cashtrail user
  | 'already_linked'; // This user already has a (different) Google account linked

// `sessionUserId`: who is logged in now. Linking must end with the same session that started it.
// The Google email does not have to match the account's: linking only proves the user controls both
export async function finishGoogleLink(
  params: GoogleCallbackParams,
  saved: OAuthCookie | null,
  sessionUserId: string | null,
): Promise<{ ok: true } | Failure<GoogleLinkFailure>> {
  if (!saved?.linkUserId || saved.linkUserId !== sessionUserId) return { ok: false, reason: 'google_failed' };
  const userId = saved.linkUserId;

  const verified = await verifyGoogleCallback(params, saved);
  if (!verified.ok) return verified;
  const { googleId } = verified.profile;

  const owner = await authAccountRepository.findByProviderAccount('GOOGLE', googleId);
  // Linking the same account twice (e.g. going back and repeating) is not an error
  if (owner) return owner.userId === userId ? { ok: true } : { ok: false, reason: 'google_in_use' };

  const providers = await authAccountRepository.findProvidersByUser(userId);
  if (providers.includes('GOOGLE')) return { ok: false, reason: 'already_linked' };

  await authAccountRepository.create({ userId, provider: 'GOOGLE', providerAccountId: googleId });
  return { ok: true };
}

// ---- Sign-in methods (/settings) ----

export async function getAuthMethods(userId: string) {
  const hasPassword = await userRepository.hasPassword(userId);
  // The token is valid but the user was deleted: treat it as not logged in (same as getCurrentUser)
  if (hasPassword === null) {
    throw new AppError(401, 'Not authenticated');
  }
  return { hasPassword, providers: await authAccountRepository.findProvidersByUser(userId) };
}

export async function unlinkProvider(userId: string, provider: AuthProvider) {
  const { hasPassword, providers } = await getAuthMethods(userId);
  if (!providers.includes(provider)) {
    throw new AppError(404, 'This sign-in method is not linked');
  }
  // Never leave an account without a way to sign in
  if (!hasPassword && providers.length === 1) {
    throw new AppError(409, 'Create a password before unlinking your only sign-in method');
  }
  await authAccountRepository.deleteByUserAndProvider(userId, provider);
}

// For users who signed up with Google. Changing an existing password is not supported (yet): it
// would need the current one
export async function setPassword(userId: string, password: string) {
  await getAuthMethods(userId); // 401 if the user no longer exists
  const updated = await userRepository.setPasswordHashIfMissing(userId, await hashPassword(password));
  if (updated === 0) {
    throw new AppError(409, 'Password is already set');
  }
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
