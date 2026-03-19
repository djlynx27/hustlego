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

Tables: zones, scores, events, weather_cache, drivers, notifications
Edge Functions: score-calculator (Gemini 2.5 Flash), push-notifications, demand-aggregator

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
