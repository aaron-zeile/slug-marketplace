import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './client/src/__tests__/setupTests.ts',
    coverage: {exclude: [
      './client/*.config.ts',
      './client/*.setup.ts',
      './server',
      './shared']},
  }
})