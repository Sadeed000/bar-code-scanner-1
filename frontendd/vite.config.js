import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:9797',
        changeOrigin: true,
      },
    },
  },

  preview: {
    host: '0.0.0.0',
    port: 6000,
    allowedHosts: ['demo.sparrownix.com'],
  },
})
