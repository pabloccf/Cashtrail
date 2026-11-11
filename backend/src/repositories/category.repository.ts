import { prisma } from '../lib/prisma.js';

// findFirst (not findUnique) because it filters by id AND userId:
// a category of another user is simply not found
export function findById(userId: string, id: string) {
  return prisma.category.findFirst({ where: { id, userId } });
}

export function findManyByUser(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    select: { id: true, name: true, color: true, icon: true, type: true },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });
}
