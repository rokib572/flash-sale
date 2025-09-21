import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/integration/**/*.test.ts'],
    environment: 'node',
    globals: true,
    reporters: ['default'],
    testTimeout: 180_000,
    hookTimeout: 180_000,
    teardownTimeout: 120_000,
    pool: 'threads',
    poolOptions: { threads: { singleThread: true } },
    isolate: true,
  },
});
