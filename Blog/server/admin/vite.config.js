import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/admin',
  build: { outDir: '../public/admin', emptyOutDir: true },
  server: {
    port: 5184,
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5050',
        changeOrigin: true,
      },
    },
  },
})
