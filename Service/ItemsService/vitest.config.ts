// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
    include: ['test/**/*.test.ts'],
    fileParallelism: false,
    hookTimeout: 120000,
    testTimeout: 3000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['test/helpers.ts', 'test/db.ts'],
    },
  },
});
