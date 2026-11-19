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
