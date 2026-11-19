import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// The CLI (migrations) uses this URL; the app uses DATABASE_URL through the adapter (src/lib/prisma.ts).
// In production DIRECT_URL is Neon's direct connection: migrations need it because the pooled
// connection (PgBouncer) does not keep the session the migration engine relies on.
// Locally there is no pooler, so DIRECT_URL is optional and DATABASE_URL is used
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error('DIRECT_URL or DATABASE_URL must be defined');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url,
  },
});
