import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['client/src/**/*.test.ts', 'client/src/**/*.test.tsx'],
    setupFiles: './client/src/__tests__/setupTests.ts',
    coverage: {
      reportsDirectory: './coverage/client',
      include: ['client/src/**/*.{ts,tsx}'],
      exclude: [
      './client/*.config.ts',
      './*.config.ts',
      './client/*.setup.ts',
      './client/src/main.tsx',
      './client/src/__tests__/**',
      './client/src/test/**',
      './server',
      './shared']},
  }
})
