import {
  ArcticFetchError,
  decodeIdToken,
  generateCodeVerifier,
  generateState,
  Google,
  OAuth2RequestError,
} from 'arctic';
import { z } from 'zod';
import { APP_URL } from './appUrl.js';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be defined');
}

// Must match, character by character, one of the redirect URIs of the OAuth client in Google Cloud
const REDIRECT_URI = `${APP_URL}/api/auth/google/callback`;

const google = new Google(clientId, clientSecret, REDIRECT_URI);

// openid: OpenID Connect, so Google also returns an id_token with who the person is.
// email and profile: the email (and whether it is verified) and the name inside that id_token
const SCOPES = ['openid', 'email', 'profile'];

// Where to send the user to sign in with Google, plus the two random values that must come back:
// - state: Google returns it untouched. If it does not match the one in our cookie, the callback was
//   not started by this browser (CSRF protection)
// - codeVerifier: the URL only carries its hash (the PKCE "challenge"). The code Google returns is
//   useless without the original verifier, which never leaves our server and our cookie
export function createGoogleAuthorization() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, SCOPES);
  // Always shows the account picker, even with a single Google session (useful on shared computers)
  url.searchParams.set('prompt', 'select_account');
  return { url, state, codeVerifier };
}

// Only the id_token claims the app uses. Validated with Zod like any other data reaching the backend
const idTokenClaimsSchema = z.object({
  aud: z.literal(clientId),
  sub: z.string().min(1),
  email: z.email(),
  email_verified: z.boolean(),
  name: z.string().optional(),
});

export interface GoogleProfile {
  googleId: string; // `sub`: permanent id of the Google account
  email: string;
  emailVerified: boolean;
  name: string | undefined;
}

// Exchanges the code for the tokens (sending the codeVerifier: PKCE) and reads who the person is.
// Returns null if Google rejects the code (expired, already used when reloading the page...) or
// cannot be reached: for the user both cases are "sign-in with Google failed, try again".
//
// decodeIdToken does NOT check the token signature. That is correct here: the token comes straight
// from Google's token endpoint over HTTPS, in a request authenticated with our client secret, so it
// cannot have been tampered with (OpenID Connect allows skipping the check in this case)
export async function getGoogleProfile(code: string, codeVerifier: string): Promise<GoogleProfile | null> {
  let idToken: string;
  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    idToken = tokens.idToken();
  } catch (error) {
    if (error instanceof OAuth2RequestError || error instanceof ArcticFetchError) {
      console.warn('Google code exchange failed:', error.message);
      return null;
    }
    throw error;
  }

  const claims = idTokenClaimsSchema.safeParse(decodeIdToken(idToken));
  if (!claims.success) {
    console.warn('Unexpected Google id_token claims:', claims.error.issues);
    return null;
  }

  return {
    googleId: claims.data.sub,
    // Stored lowercase, like the emails of the normal register
    email: claims.data.email.toLowerCase(),
    emailVerified: claims.data.email_verified,
    name: claims.data.name,
  };
}
