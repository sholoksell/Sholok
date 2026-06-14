import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/blog/admin',
  build: { outDir: 'dist' },
  server: {
    port: 5184,
    proxy: {
      '/blog-api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/blog-api/, '/api'),
      },
      '/blog-uploads': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/blog-uploads/, '/uploads'),
      },
    },
  },
})
