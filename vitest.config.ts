import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Exclure les specs Playwright (src/e2e/) du runner Vitest
    exclude: ['**/node_modules/**', '**/dist/**', 'src/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      // Only measure coverage on app source, not generated/ui code
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/components/ui/**',
        'src/aviationstack-mock.ts',
        'src/test/**',
        'src/e2e/**',
        'src/main.tsx',
        'src/index.css',
        '**/*.d.ts',
      ],
      thresholds: {
        // Phase 1 targets — progressive. Raise per sprint until 80%.
        lines: 30,
        functions: 30,
        branches: 25,
        statements: 30,
      },
    },
  },
});
