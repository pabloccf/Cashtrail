import { prisma } from '../lib/prisma.js';

// findFirst (not findUnique) because it filters by id AND userId:
// a category of another user is simply not found
export function findById(userId: string, id: string) {
  return prisma.category.findFirst({ where: { id, userId } });
}
