---

# HustleGo

Projet Vite + React + TypeScript + PWA

## Installation

```bash
npm install
```

## Démarrer en local

```bash
npm run dev
```

## Build production

```bash
npm run build
```

## PWA

- Manifest et service worker générés automatiquement
- Icônes à remplacer dans `public/pwa-icon-192.png` et `public/pwa-icon-512.png`
- Installable sur mobile via Chrome

## Supabase

Pour connecter Supabase, ajoute les variables d'environnement dans Vercel :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Déploiement Vercel

- Connecte le repo GitHub à Vercel
- Build command : `npm run build`
- Output directory : `dist`
- Ajoute les variables d'environnement Supabase

## Personnalisation

Remplace les icônes et adapte le manifest dans vite.config.ts si besoin.

## Tests

### Lancer les tests unitaires

```bash
npm run test
```

Ce projet utilise [Vitest](https://vitest.dev/) et [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) pour les tests React.

- Les fichiers de test se terminent par `.test.tsx` ou `.test.ts` dans `src/`.
- Exemple : voir `src/App.test.tsx`.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
