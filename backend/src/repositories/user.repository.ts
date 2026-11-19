import { prisma } from '../lib/prisma.js';
import type { DefaultCategory } from '../constants/defaultCategories.js';

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
  passwordHash: string;
}

// Nested write: Prisma runs the user insert and the categories insert in a single
// database transaction, so a user can never end up without categories
export function createWithCategories(data: NewUserData, categories: readonly DefaultCategory[]) {
  return prisma.user.create({
    data: {
      ...data,
      categories: { createMany: { data: [...categories] } },
    },
    select: publicUserSelect,
  });
}
