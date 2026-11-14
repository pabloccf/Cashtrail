import { createHash, timingSafeEqual } from 'node:crypto';

const secret = process.env.CRON_SECRET;
if (!secret) {
  throw new Error('CRON_SECRET is not defined');
}

function sha256(text: string): Buffer {
  return createHash('sha256').update(text).digest();
}

const EXPECTED_HASH = sha256(secret);

// A normal `===` stops at the first different character, so measuring how long it takes could
// reveal the secret character by character. timingSafeEqual always takes the same time.
// It only accepts buffers of the same length, so both values are hashed first: every SHA-256 is
// 32 bytes, and this way not even the length of the secret is revealed
export function isValidCronSecret(provided: string | undefined): boolean {
  if (!provided) return false;
  return timingSafeEqual(sha256(provided), EXPECTED_HASH);
}
