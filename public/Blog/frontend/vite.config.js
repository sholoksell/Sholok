import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/blog',
  build: { outDir: 'dist' },
  server: {
    port: 5180,
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
      '/socket.io': { target: 'http://localhost:5050', changeOrigin: true, ws: true },
    },
  },
});
