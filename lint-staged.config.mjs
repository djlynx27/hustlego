export default {
  'src/**/*.{ts,tsx}': ['eslint --max-warnings 0', () => 'npm run type-check'],
};
