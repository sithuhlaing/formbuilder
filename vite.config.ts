
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'vite.svg'],
      manifest: {
        name: 'Form Builder - Interactive Form Creator',
        short_name: 'Form Builder',
        description: 'Create interactive forms with drag and drop functionality',
        theme_color: '#3b82f6',
        background_color: '#f3f4f6',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'vite.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'vite.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        skipWaiting: true
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  base: process.env.NODE_ENV === 'production' ? '/formbuilder/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          dnd: ['react-dnd', 'react-dnd-html5-backend']
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/__tests__/**',
        '**/*.d.ts',
        '**/*.test.{ts,tsx,js,jsx}',
        '**/*.spec.{ts,tsx,js,jsx}',
        '**/coverage/**',
        '**/dist/**',
        '**/dev-dist/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'vite.config.ts',
        'postcss.config.js',
        'tailwind.config.ts',
        'eslint.config.js',
        '**/*.config.{ts,js}',
        'src/pwa.ts'
      ],
      include: [
        'src/**/*.{ts,tsx,js,jsx}'
      ],
      all: true,
      clean: true,
      skipFull: false,
      thresholds: {
        global: {
          branches: 70,
          functions: 75,
          lines: 80,
          statements: 80
        },
        perFile: true
      },
      watermarks: {
        statements: [50, 80],
        functions: [50, 75], 
        branches: [50, 70],
        lines: [50, 80]
      }
    }
  }
})
