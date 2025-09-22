import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/ui/pages/**/*.test.tsx'],
    pool: 'threads',
    poolOptions: { threads: { minThreads: 1, maxThreads: 1 } },
  },
  resolve: {
    alias: {
      '@flash-sale/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
});
