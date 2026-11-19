import { prisma } from '../lib/prisma.js';
import type { AuthProvider } from '../generated/prisma/enums.js';

// Who owns this provider account (e.g. this Google `sub`), or null if nobody has linked it
export function findByProviderAccount(provider: AuthProvider, providerAccountId: string) {
  return prisma.authAccount.findUnique({
    // Prisma names the compound unique key after its fields
    where: { provider_providerAccountId: { provider, providerAccountId } },
    select: { userId: true },
  });
}

// Providers linked to a user, e.g. ['GOOGLE']
export function findProvidersByUser(userId: string) {
  return prisma.authAccount
    .findMany({ where: { userId }, select: { provider: true }, orderBy: { provider: 'asc' } })
    .then((accounts) => accounts.map((account) => account.provider));
}

interface NewAuthAccount {
  userId: string;
  provider: AuthProvider;
  providerAccountId: string;
}

export function create(data: NewAuthAccount) {
  return prisma.authAccount.create({ data, select: { id: true } });
}

// deleteMany with the userId in the filter, so it can only delete the user's own link.
// Returns how many rows were deleted (0 or 1)
export function deleteByUserAndProvider(userId: string, provider: AuthProvider) {
  return prisma.authAccount.deleteMany({ where: { userId, provider } }).then((result) => result.count);
}
