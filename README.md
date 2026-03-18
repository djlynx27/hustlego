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
