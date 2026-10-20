import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// During `npm run dev` Vite serves the SPA while Flask handles the API.
// Keep changeOrigin off so the backend sees the browser's Host header and its
// same-origin check passes.
const apiTarget = process.env.VITE_DEV_API_TARGET || 'http://127.0.0.1:5001'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: apiTarget, changeOrigin: false },
      '/media': { target: apiTarget, changeOrigin: false },
    },
  },
})
