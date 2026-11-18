import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/news/',
  server: {
    proxy: {
      '/news-api': { target: 'http://localhost:5002', rewrite: (p) => p.replace(/^\/news-api/, '') },
    },
  },
  css: {
    postcss: { plugins: [] },
  },
  build: { outDir: 'dist', emptyOutDir: true },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
