/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'src': path.resolve(__dirname, './src'),
      'public': path.resolve(__dirname, './public')
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    alias: {
      'src': path.resolve(__dirname, './src'),
      'public': path.resolve(__dirname, './public')
    },
    exclude: [
      'tests/e2e/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**'
    ]
  }
})
