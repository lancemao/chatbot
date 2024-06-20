import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/chatx/',
  build: {
    target: 'es2015',
    modulePreload: {
      polyfill: false
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/'),
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      "/api/": {
        target: "http://127.0.0.1:5001"
      },
      // for OA like dingtalk
      "/agent/": {
        target: "http://127.0.0.1:5000"
      }
    },
  }
})
