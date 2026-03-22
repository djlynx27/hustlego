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
      // Only measure coverage on pure-logic lib code, not browser-coupled React
      include: ['src/lib/**/*.{ts,tsx}'],
      exclude: [
        'src/lib/aiAgents.ts',
        'src/lib/aiSimulation.ts',
        'src/aviationstack-mock.ts',
        'src/test/**',
        'src/e2e/**',
        'src/main.tsx',
        'src/index.css',
        '**/*.d.ts',
      ],
      thresholds: {
        // Raised after the follow-up coverage sprint.
        // Current measured coverage on src/lib: 97.54% statements / 88.66% branches /
        // 99.09% functions / 99.08% lines.
        // Keep a small buffer under the observed result to make regressions fail
        // without making the gate overly brittle on routine test churn.
        lines: 99,
        functions: 99,
        branches: 88,
        statements: 97,
      },
    },
  },
});
