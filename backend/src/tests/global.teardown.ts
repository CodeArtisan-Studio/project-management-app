/**
 * globalTeardown — runs once after all test suites complete.
 *
 * The test database is preserved between runs for faster startup.
 * Individual test files handle their own data cleanup via beforeEach/afterAll.
 */
export default async function globalTeardown(): Promise<void> {
  // No-op — test data cleanup is handled per-suite.
}
