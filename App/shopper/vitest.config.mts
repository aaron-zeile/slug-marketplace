import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
 
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true
  },
  test: {
    environment: 'jsdom',
    testTimeout: 10000, 
    hookTimeout: 20000, 
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      include: [
        'src/**',
      ],
      exclude: [
        'src/app/layout.tsx',
        'src/**/index.ts',
      ],
    },
  },
})