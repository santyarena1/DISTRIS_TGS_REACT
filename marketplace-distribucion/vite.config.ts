import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/auth': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/sync': 'http://localhost:3000',
      '/newbytes-products': 'http://localhost:3000',
      '/gruponucleo-products': 'http://localhost:3000',
      '/search': 'http://localhost:3000',
    }
  }
})