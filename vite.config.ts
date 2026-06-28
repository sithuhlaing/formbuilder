/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/formbuilder/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: [
      'src/__tests__/layoutEngine.test.ts',
      'src/__tests__/componentUtils.test.ts',
      'src/__tests__/useSimpleFormBuilder.test.ts',
      'src/__tests__/canvas.test.tsx'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      include: [
        'src/app/components/canvas.tsx',
        'src/hooks/useSimpleFormBuilder.ts',
        'src/core/layoutEngine.ts',
        'src/core/componentUtils.ts'
      ]
    }
  },
});
