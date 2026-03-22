# CLAUDE.md — HustleGo

Ce fichier est lu automatiquement par Claude Code à chaque session.

---

## Contexte projet

**App:** HustleGo
**Repo:** github.com/djlynx27/geohustle
**Stack:** React + Vite + TypeScript + Tailwind + Supabase
**Dev tools:** Claude Code (principal), GitHub Copilot Agent (Sonnet)
**Deploy:** Lovable / Vercel

### Territoires couverts

Montreal, Laval, Longueuil/Rive-Sud

### Plateformes chauffeur

Lyft, DoorDash, SkipTheDishes, Hypra Pro S

### Véhicule

2018 Hyundai Santa Fe Sport

### Structure Supabase

Tables: zones, scores, events, weather_cache, drivers, notifications, zone_context_vectors, platform_signals, weight_history, trip_predictions
Edge Functions: score-calculator (Gemini 2.5 Flash), ai-score-analysis, analyze-screenshot, generate-daily-report, context-embeddings, surge-detector, platform-signal-collector, weight-calibrator

---

## Conventions de code

- TypeScript strict — zero `any`, zero `as unknown`
- Commits: `feat(scope): description` / `fix(scope):` / `chore(scope):`
- Branche: `feature/xxx`, `fix/xxx`, `hotfix/xxx`
- Tests: Vitest pour unitaires, Playwright pour E2E
- Formatage: Prettier, 2 espaces, pas de semi, single quotes

---

## Skills actifs

Pour un skill détaillé, lire le fichier dans `.claude/skills/`.

### supabase-expert

Edge Functions: toujours inclure corsHeaders + handler OPTIONS.
Service role key = bypass automatique RLS.
Lire `.claude/skills/supabase-expert/SKILL.md` pour le détail.

### ai-scoring-engine

Score zone = f(heure, jour, météo, événements) normalisé 0.0–10.0.
Modèle: Gemini 2.5 Flash via Edge Function score-calculator.
Recalcul toutes les 15 min via pg_cron.
Réponse Gemini: JSON strict {"score": X.X, "factors": {...}, "reasoning": "..."}.
Lire `.claude/skills/ai-scoring-engine/SKILL.md` pour le code complet.

### demand-forecaster

Poids: time(35%) + day(20%) + weather(20%) + events(15%) + historical(10%).
Vendredi/Samedi = multiplicateurs max.
Pluie > 5mm = +0.4 au score weather.
Lire `.claude/skills/demand-forecaster/SKILL.md`.

### react-native-pwa

Plugin: vite-plugin-pwa avec registerType autoUpdate.
Icônes requises: 192px et 512px dans public/icons/.
GPS: navigator.geolocation.watchPosition avec enableHighAccuracy true.
Lire `.claude/skills/react-native-pwa/SKILL.md`.

### typescript-strict

Config tsconfig: strict true, noUncheckedIndexedAccess true.
Jamais de any — utiliser unknown + type guard ou Zod.
AsyncState pattern: idle / loading / success / error.
Lire `.claude/skills/typescript-strict/SKILL.md`.

### api-integrator

Open-Meteo: gratuit, sans clé.
Ticketmaster: VITE_TICKETMASTER_KEY, city=Montreal, countryCode=CA.
Mapbox: VITE_MAPBOX_TOKEN, style dark-v11.
Gemini: via Edge Function uniquement, jamais côté client.
Lire `.claude/skills/api-integrator/SKILL.md`.

### map-visualizer

Carte principale: Mapbox GL JS via react-map-gl.
Fallback sans token: Leaflet + CartoDB dark tiles.
Heatmap: couleur verte→orange→rouge selon score.
Lire `.claude/skills/map-visualizer/SKILL.md`.

### surge-engine

Surge = currentScore / (baselineScore × DOW × seasonal) → multiplicateur 1.0–2.5×.
Vecteur contexte 8D → zone_context_vectors (pgvector, ivfflat cosine).
Classes: normal (<1.18), elevated (1.18–1.44), high (1.45–1.79), peak (≥1.80).
Lire `.claude/skills/surge-engine/SKILL.md` pour le code complet.

### git-workflow

Toujours git pull --rebase avant d'éditer en local.
Après fix local: git push origin main pour sync Lovable.
Jamais commiter: .env, .env.local, supabase/.temp/
Lire `.claude/skills/git-workflow/SKILL.md`.

---

## Commandes fréquentes

```powershell
# Dev local
npm run dev
supabase start
supabase functions serve score-calculator

# Déployer Edge Functions
supabase functions deploy score-calculator --no-verify-jwt
supabase secrets set GEMINI_API_KEY=xxx

# Tests
npm run type-check
npm run test:run
```

---

## Anti-patterns interdits

- `any` TypeScript → utiliser `unknown` + type guard
- useEffect sans cleanup sur subscriptions Supabase
- Clés API sensibles côté client (Gemini notamment)
- Commits sur main sans test de build
- Edge Functions sans handler OPTIONS pour CORS
- Score Gemini sans try/catch + validation JSON

---

## Architecture — Progressive Disclosure Architecture (PDA)

Principes issus du document "Vers une Architecture Logique et Physique Intégrée" (implémenté mars 2026).

### 1. Evidence-First Exploration

Avant toute modification, lire :

- Les fichiers ouverts + README.md + CLAUDE.md
- `package.json`, `tsconfig.json`, `.env.example`
- L'historique Git récent (`git log --oneline -20`)
- Les commentaires `TODO`, `FIXME`, `HACK` dans le code

Ne jamais modifier du code non lu. Reconstruire le contexte complet avant d'agir.

### 2. Complexité cyclomatique

Seuil maximal : **M ≤ 10** (ISO 25010).

- ESLint rule `complexity: ['warn', 10]` activée dans `eslint.config.js`
- Fonctions > 10 branches : OBLIGATOIREMENT extraire en sous-fonctions
- Pages React (DriveScreen, TodayScreen, etc.) : refactoriser progressivement avec des composants spécialisés

### 3. Couverture de tests — cibles ISO 25010

| Métrique   | Seuil actuel | Cible finale |
| ---------- | ------------ | ------------ |
| Statements | ≥ 78%        | ≥ 80%        |
| Branches   | ≥ 65%        | ≥ 80%        |
| Functions  | ≥ 83%        | ≥ 85%        |
| Lines      | ≥ 80%        | ≥ 85%        |

Thresholds configurés dans `vitest.config.ts`. Un build CI échoue si on descend sous ces seuils.
Fichiers sous-testés : `learningSync.ts` (fonctions async Supabase), `scoringEngine.ts` (time rules internes).

### 4. Software Immunology (détection automatique)

À chaque session, scanner :

- Erreurs TypeScript : `npm run type-check -- --pretty false`
- Erreurs ESLint : `npm run lint`
- Tests régressés : `npm run test:run`
- Secrets exposés : Gitleaks intégré dans CI

Si une régression est détectée → corriger immédiatement, ne pas commiter.

### 5. Antifragilité — Protocole de résolution d'obstacles

1. **Résoudre directement** — corriger à la source
2. **Modifier** — adapter le code autour du problème
3. **Contourner** — alternative produisant le même résultat
4. **Recréer** — réécrire la partie problématique from scratch
5. **Imiter** — reproduire le comportement par un autre mécanisme

Ne jamais s'arrêter sur un obstacle. Documenter ce qui a été contourné et pourquoi.

### 6. Intégrité des commits

Validation chain obligatoire avant chaque commit :

```bash
npm run test:run
npm run type-check -- --pretty false
npm run lint
git add -A && git commit -m "type(scope): description"
git push origin main
```

Jamais de `--no-verify` sauf urgence documentée.

### 7. Souveraineté des données

- Gemini : appelé uniquement via Edge Functions Supabase (jamais côté client)
- Clés Supabase : `supabase/config.toml` + variables d'environnement Vercel
- Aucune donnée utilisateur envoyée à des APIs tierces sans consentement explicite
- Edge Functions : toujours `corsHeaders` + handler `OPTIONS` + try/catch complet
