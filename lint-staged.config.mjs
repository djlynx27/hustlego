export default {
  // --max-warnings 20 per-file: blocks real errors + limits new warnings.
  // Complexity warnings on existing large components (DriveScreen, TodayScreen, etc.)
  // are tech debt tracked at the project level via `npm run lint` (max-warnings 73).
  'src/**/*.{ts,tsx}': ['eslint --max-warnings 20', () => 'npm run type-check'],
};
