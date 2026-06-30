import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/webtoon/',
  server: {
    port: parseInt(process.env.PORT) || 5175,
    strictPort: false,
  },
})
