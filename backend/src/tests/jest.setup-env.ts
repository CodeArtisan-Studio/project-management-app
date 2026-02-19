/**
 * setupFiles — runs in each test worker before ANY module is imported.
 *
 * By loading .env.test here first, all process.env variables are already set
 * when env.ts is later imported. dotenv.config() does not override existing
 * variables by default, so the test values are preserved throughout the suite.
 */
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.test') });
