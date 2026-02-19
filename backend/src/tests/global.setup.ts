/**
 * globalSetup — runs once in a separate process before any test worker starts.
 *
 * Responsibilities:
 *  1. Load .env.test so DATABASE_URL points to the test database in this process.
 *  2. Run `prisma migrate deploy` to ensure the test DB schema is up-to-date.
 *
 * Note: setupFiles do NOT run in this process (it is isolated from test workers),
 * so we load the env manually here.
 */
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

export default async function globalSetup(): Promise<void> {
  dotenv.config({ path: path.join(process.cwd(), '.env.test') });

  console.log('\n🧪 Applying Prisma migrations to test database...');

  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env },
  });

  console.log('✓ Test database ready\n');
}
