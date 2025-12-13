import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // ✅ NUEVA REGLA MAESTRA:
      // Esto atrapa '/api/config' y cualquier otra cosa que empiece con /api
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        // No necesitamos rewrite porque el backend ya espera /api/...
      },

      // --- REGLAS ESPECÍFICAS (Las mantenemos por compatibilidad con tu código viejo) ---
      '/auth': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`,
      },
      '/users': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`,
      },
      '/sync': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`,
      },
      '/newbytes-products': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`,
      },
      '/gruponucleo-products': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`,
      },
      '/tgs-products': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`,
      },
      '/elit-products': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`,
      },
      '/search': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`,
      }
    }
  }
})