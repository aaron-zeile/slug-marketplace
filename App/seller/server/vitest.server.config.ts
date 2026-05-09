import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['server/**/*.test.ts'],
    coverage: {exclude: [
      './server/*.config.ts',
      './*.config.ts',
      './server/*.setup.ts',
      './client',
      './shared']},
  }
})