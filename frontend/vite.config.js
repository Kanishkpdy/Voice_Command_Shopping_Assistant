import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: API_URL,   // Use Render backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: { outDir: 'dist' }
})
