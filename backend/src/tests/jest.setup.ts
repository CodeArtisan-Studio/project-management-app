/**
 * setupFilesAfterEnv — runs in each test worker after Jest is installed.
 *
 * Registers a global afterAll hook that disconnects both the test Prisma client
 * and the application's Prisma/pg pool so Jest exits cleanly without open
 * handle warnings.
 */
import { disconnectTestDb } from './helpers/test-db';
import { prisma, pool } from '@/config/prisma';

afterAll(async () => {
  // Disconnect the app's database connection opened when the test imported `app`.
  await prisma.$disconnect();
  await pool.end();

  // Disconnect the test-only client used for cleanup queries.
  await disconnectTestDb();
});
