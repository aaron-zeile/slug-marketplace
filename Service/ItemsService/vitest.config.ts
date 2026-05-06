// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
    include: ['test/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 3000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
