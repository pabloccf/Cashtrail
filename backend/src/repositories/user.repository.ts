import { prisma } from '../lib/prisma.js';

// Only selects the id: passwordHash must never leave the repository by accident
export function findIdByEmail(email: string) {
  return prisma.user.findUnique({ where: { email }, select: { id: true } });
}
