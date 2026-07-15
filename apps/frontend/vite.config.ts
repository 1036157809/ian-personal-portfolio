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
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    sourcemap: false,
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue-router') || id.includes('pinia') || id.includes('vue-i18n') || id.includes('/vue/dist/') || id.includes('/vue/jsx-runtime/')) {
              return 'vue-vendor'
            }
            if (id.includes('echarts')) {
              return 'echarts'
            }
            if (id.includes('three')) {
              return 'three'
            }
            if (id.includes('ol')) {
              return 'openlayers'
            }
            if (id.includes('jspdf') || id.includes('mammoth')) {
              return 'file-converter'
            }
            if (id.includes('marked') || id.includes('dompurify') || id.includes('entities')) {
              return 'markdown'
            }
            return 'vendor'
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    exclude: [
      'tests/e2e/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**'
    ]
  }
})
