import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const backendProxy = {
  '/api': { target: 'http://127.0.0.1:9797', changeOrigin: true },
  '/uploads': { target: 'http://127.0.0.1:9797', changeOrigin: true },
};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: backendProxy,
  },

  preview: {
    host: '0.0.0.0',
    port: 6000,
    strictPort: true,
    proxy: backendProxy,
    allowedHosts: ['demo.sparrownix.com'],
  },
})
