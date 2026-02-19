/**
 * Standalone Prisma client for integration tests.
 *
 * Uses process.env.DATABASE_URL which is overridden to the test database
 * by jest.setup-env.ts before any module is imported. This client is separate
 * from the application's prisma.ts so tests can perform cleanup queries
 * independently of the app's connection lifecycle.
 */
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const testPrisma = new PrismaClient({ adapter });

export async function disconnectTestDb(): Promise<void> {
  await testPrisma.$disconnect();
  await pool.end();
}
