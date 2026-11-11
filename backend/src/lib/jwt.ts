import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error('JWT_SECRET is not defined');
}
// TypeScript does not keep the narrowing from the `if` inside the functions below
const JWT_SECRET: string = secret;

// Pinned on both sides so a token signed with another algorithm (e.g. "none") is never accepted
const ALGORITHM = 'HS256';

export const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

// `sub` (subject) is the standard JWT claim for "who this token is about"
export function signSessionToken(userId: string): string {
  return jwt.sign({}, JWT_SECRET, {
    subject: userId,
    algorithm: ALGORITHM,
    expiresIn: SESSION_DURATION_SECONDS,
  });
}

// Returns the user id, or null if the token is invalid, tampered with or expired
export function verifySessionToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: [ALGORITHM] });
    return typeof payload === 'object' && typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}
