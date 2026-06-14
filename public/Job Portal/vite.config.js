import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/job-portal/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5183,
    proxy: {
      '/api': {
        target: 'http://localhost:5005',
        changeOrigin: true,
      },
    },
  },
})
