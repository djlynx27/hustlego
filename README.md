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
- `VITE_TOMTOM_KEY` pour enrichir le scoring avec le trafic TomTom

### Activer le module learning

Le moteur d'apprentissage, la synchronisation des shifts et la recherche de
contextes similaires reposent sur la migration
`supabase/migrations/20260318_learning_foundation.sql`.

Si la CLI Supabase n'est pas disponible localement, exécute simplement ce
fichier dans le SQL Editor du projet Supabase.

Ensuite :

1. Charge éventuellement les données de base de `supabase-seed.sql`.
2. Lance l'app puis ouvre l'écran Admin.
3. Utilise `Sync Supabase` dans la boucle d'apprentissage ou termine un shift
   pour peupler `ema_patterns`, `zone_beliefs`, `predictions` et
   `demand_patterns`.
4. Le bloc `Contextes similaires` devient utile dès que des patterns ont été
   synchronisés et que le RPC `match_similar_contexts` existe côté Supabase.
5. En fallback (quand les scores DB ne sont pas disponibles), le scoring live
   des zones applique aussi un bonus learning à partir des contextes similaires
   récupérés via `match_similar_contexts`.

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
