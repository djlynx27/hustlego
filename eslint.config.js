import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import security from 'eslint-plugin-security';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    'dist',
    // shadcn/ui — generated code, never modify manually
    'src/components/ui/**',
    // AviationStack mock — generated helper, not app code
    'src/aviationstack-mock.ts',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // any → warn until full type migration is complete.
      // Each any should be progressively replaced with unknown + type guard.
      '@typescript-eslint/no-explicit-any': 'warn',

      // react-refresh: warn only (only affects DX / HMR, not production correctness)
      'react-refresh/only-export-components': 'warn',

      // React Compiler rules (included in react-hooks v7 recommended) — disabled.
      // This project uses standard React 19 without the Babel/Vite React Compiler plugin.
      // Re-enable if/when the React Compiler is added to vite.config.ts.
      'react-hooks/static-components': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/set-state-in-render': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/hooks': 'off',
      'react-hooks/capitalized-calls': 'off',
      'react-hooks/use-memo': 'off',
      'react-hooks/void-use-memo': 'off',
      'react-hooks/component-hook-factories': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/globals': 'off',
      'react-hooks/memoized-effect-dependencies': 'off',
      'react-hooks/no-deriving-state-in-effects': 'off',
      'react-hooks/error-boundaries': 'off',
      'react-hooks/invariant': 'off',
      'react-hooks/todo': 'off',
      'react-hooks/gating': 'off',
      'react-hooks/fire': 'off',
    },
  },
  // ─── Security rules (OWASP Top 10 patterns) ───────────────────────────────
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { security },
    rules: {
      // Detect eval(), new Function(), setTimeout(string) — injection risks
      'security/detect-eval-with-expression': 'error',
      // Detect non-literal RegExp (ReDoS risk)
      'security/detect-non-literal-regexp': 'warn',
      // Object injection: off — TypeScript's type system already provides safety
      // for typed key access; this rule generates excessive false positives.
      'security/detect-object-injection': 'off',
      // Detect Buffer allocation with noAssert flag
      'security/detect-buffer-noassert': 'error',
      // Detect child_process usage
      'security/detect-child-process': 'error',
      // Detect disable of certificate validation
      'security/detect-disable-mustache-escape': 'error',
      // Detect HTML injected via innerHTML
      'security/detect-possible-timing-attacks': 'warn',
    },
  },
]);
