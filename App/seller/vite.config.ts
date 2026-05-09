import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'client',
  base: process.env.NODE_ENV === 'production' ? '/seller/' : '/',
  plugins: [react()],
  server: {
    proxy: {
      '/seller/api': {
        target: 'http://localhost:3010',
        changeOrigin: true,
      },
    },
  },
});
