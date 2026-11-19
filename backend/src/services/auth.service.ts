import { AppError } from '../lib/appError.js';
import { signSessionToken } from '../lib/jwt.js';
import { DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from '../lib/password.js';
import { DEFAULT_CATEGORIES } from '../constants/defaultCategories.js';
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
