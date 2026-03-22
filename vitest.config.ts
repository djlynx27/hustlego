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
        // Raised after architecture hardening sprint #3 (March 2026).
        // +55 tests added — async Supabase mocking, zone profiles, getDayOfWeekFactor branches.
        // Coverage: 94.26% statements / 84.6% branches / 98.19% functions / 95.93% lines.
        // Remaining gaps: learningSync cleanup code + scoringEngine private time-rule helpers.
        lines: 94,
        functions: 97,
        branches: 83,
        statements: 93,
      },
    },
  },
});
