import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/qna/',
  css: {
    postcss: {
      plugins: [],
    },
  },
  server: {
    port: 5200,
    strictPort: true,
  },
  preview: {
    port: 5201,
    strictPort: true,
  },
})
