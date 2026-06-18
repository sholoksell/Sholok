import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

// Redirect /admin -> /admin/ so the admin panel base URL works without trailing slash
const adminTrailingSlashRedirect = () => ({
  name: 'admin-trailing-slash-redirect',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/admin') {
        res.statusCode = 302
        res.setHeader('Location', '/admin/')
        res.end()
        return
      }
      next()
    })
  },
})

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/shopping/' : '/',
  plugins: [
    adminTrailingSlashRedirect(),
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
      deleteOriginFile: false
    }),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'state-vendor': ['zustand', 'axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.warn'],
        passes: 2
      },
      mangle: true,
      format: {
        comments: false
      }
    },
  },
  server: {
    port: 3000,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Admin panel API (admin app uses /admin-api which maps to backend /api)
      '/admin-api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/admin-api/, '/api'),
      },
      // Admin panel dev server (Vite) is proxied at /admin
      '/admin': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'zustand'],
  },
}))
