# HustleGo — Guide de déploiement Vercel

## 1. Prérequis
- Compte Vercel (vercel.com) connecté au dépôt GitHub
- Projet Supabase avec URL + anon key
- Clé Mapbox (maps.mapbox.com)

## 2. Variables d'environnement Vercel

Dans **Vercel → Settings → Environment Variables**, ajouter :

| Variable | Obligatoire | Source |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase → Settings → API |
| `VITE_MAPBOX_TOKEN` | ✅ | maps.mapbox.com → Tokens |
| `VITE_TOMTOM_KEY` | ✅ | developer.tomtom.com → My Apps |
| `VITE_STM_KEY` | ✅ (MTL) | portail.developpeurs.stm.info — **GRATUIT** |
| `VITE_AVIATIONSTACK_KEY` | ⚡ optionnel | aviationstack.com — plan Free (100 req/mois) |
| `VITE_TICKETMASTER_KEY` | ⚡ optionnel | developer.ticketmaster.com — **GRATUIT** |
| `VITE_FOURSQUARE_API_KEY` | ⚡ optionnel | foursquare.com/developer |

### Obtenir la clé STM (5 min, gratuit)
1. Aller sur **portail.developpeurs.stm.info**
2. Créer un compte → **Créer une application**
3. Activer le produit **GTFS-RT** (serviceAlerts, vehiclePositions, tripUpdates)
4. Copier la clé API → `VITE_STM_KEY` dans Vercel

### Obtenir la clé AviationStack (optionnel)
1. **aviationstack.com** → Sign Up Free
2. 100 requêtes/mois (mises en cache 4h dans l'app = largement suffisant)
3. Sans cette clé : l'app utilise les vagues YUL préprogrammées (6h-10h, 11h-14h, 17h-21h)

## 3. Déploiement
1. `git push origin main` depuis le projet
2. GitHub Actions applique automatiquement les migrations Supabase
3. Vercel détecte le push et builds/déploie automatiquement

## 4. Notes
- PWA Vite — export statique géré par Vercel
- Toutes les routes sont SPA (rewrite dans `vercel.json`)
- Migrations Supabase : voir `.github/workflows/supabase-migrations.yml`

## 5. Dépannage
- Page blanche → vérifier les vars d'env et CORS Supabase (autoriser le domaine Vercel)
- STM badge absent → `VITE_STM_KEY` manquante ou clé invalide (l'app continue de fonctionner normalement)
- YUL badge — fonctionne sans clé AviationStack (schedule statique intégré)
