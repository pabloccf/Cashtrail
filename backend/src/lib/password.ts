import bcrypt from 'bcrypt';

// Cost factor: each +1 doubles the time to compute a hash (and to brute-force it)
const BCRYPT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

// Hash of a random value nobody knows. Login compares against it when the email does not exist,
// so the response takes the same time and does not reveal which emails are registered
export const DUMMY_PASSWORD_HASH = bcrypt.hashSync(crypto.randomUUID(), BCRYPT_ROUNDS);
