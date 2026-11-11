import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Forwards /api/* to the backend, so the frontend always uses relative URLs.
    // In production the Vercel rewrite (vercel.json) does the same job
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
