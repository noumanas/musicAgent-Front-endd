import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const backend = process.env.VITE_API_BASE_URL || 'https://music-agent-backend.vercel.app'
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: mode === 'development'
        ? {
            '/api': backend,
            '/health': backend
          }
        : undefined
    },
    preview: {
      port: 4173
    }
  }
})
