import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
 
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true
  },
  test: {
    globals: true,
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
        'src/app/buyer/components/CheckoutPage.tsx',
        'src/app/buyer/payment/**',
        'src/app/payment-success/**',
        'src/components/providers/**',
        'src/app/buyer/api/route.ts',
        'src/lib/convertToSubcurrency.ts',
      ],
    },
  },
})