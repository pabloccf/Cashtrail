import { prisma } from '../lib/prisma.js';
import type { DefaultCategory } from '../constants/defaultCategories.js';
import type { AuthProvider } from '../generated/prisma/enums.js';

// Fields that are safe to send to the client. passwordHash is never among them
const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  currency: true,
  createdAt: true,
} as const;

// The only function that returns passwordHash, and only for the login check. It is null if the
// user signed up with Google. The service must strip it before returning the user
export function findWithPasswordByEmail(email: string) {
  return prisma.user.findUnique({ where: { email }, select: { ...publicUserSelect, passwordHash: true } });
}

export function existsByEmail(email: string) {
  return prisma.user.findUnique({ where: { email }, select: { id: true } }).then((user) => user !== null);
}

export function findPublicById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId }, select: publicUserSelect });
}

// Whether the user has a password, without ever returning the hash. Null if the user does not exist
export function hasPassword(userId: string) {
  return prisma.user
    .findUnique({ where: { id: userId }, select: { passwordHash: true } })
    .then((user) => (user ? user.passwordHash !== null : null));
}

// Sets the password only if the user has none: the condition and the update are a single query,
// so two requests at the same time cannot both succeed. Returns how many rows changed (0 or 1)
export function setPasswordHashIfMissing(userId: string, passwordHash: string) {
  return prisma.user
    .updateMany({ where: { id: userId, passwordHash: null }, data: { passwordHash } })
    .then((result) => result.count);
}

export interface ProfileData {
  name: string;
  currency: string;
}

export function updateProfile(userId: string, data: ProfileData) {
  return prisma.user.update({ where: { id: userId }, data, select: publicUserSelect });
}

interface NewUserData {
  email: string;
  name: string;
  passwordHash?: string; // Missing when signing up with Google
}

interface NewAuthAccount {
  provider: AuthProvider;
  providerAccountId: string;
}

// Nested write: Prisma runs the user insert, the categories insert and (when signing up with
// Google) the AuthAccount insert in a single database transaction, so a user can never end up
// without categories or a Google user without the link that lets them sign in
export function createWithCategories(
  data: NewUserData,
  categories: readonly DefaultCategory[],
  authAccount?: NewAuthAccount,
) {
  return prisma.user.create({
    data: {
      ...data,
      categories: { createMany: { data: [...categories] } },
      ...(authAccount && { authAccounts: { create: authAccount } }),
    },
    select: publicUserSelect,
  });
}
