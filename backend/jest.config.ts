import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
  },
  // Runs before any module is imported — sets process.env from .env.test
  setupFiles: ['<rootDir>/src/tests/jest.setup-env.ts'],
  // Runs after test framework is installed — registers global hooks
  setupFilesAfterEnv: ['<rootDir>/src/tests/jest.setup.ts'],
  // Runs once before all test suites (separate process) — applies DB migrations
  globalSetup: '<rootDir>/src/tests/global.setup.ts',
  // Runs once after all test suites — final disconnect
  globalTeardown: '<rootDir>/src/tests/global.teardown.ts',
  testTimeout: 15000,
  verbose: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/generated/**',
    '!src/tests/**',
    '!src/**/*.swagger.ts',
    '!src/server.ts',
  ],
  coverageDirectory: 'coverage',
};

export default config;
