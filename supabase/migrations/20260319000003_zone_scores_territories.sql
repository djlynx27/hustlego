-- ══════════════════════════════════════════════════════════════════════
-- HustleGo — Initialisation scores de base + territoires
-- Zones: 40 au total (19 mtl, 11 lvl, 10 lng)
-- Scores basés sur: type de zone + position géographique + historique réel
-- Territoires: montreal / laval / longueuil
-- ══════════════════════════════════════════════════════════════════════

-- ── MONTRÉAL ────────────────────────────────────────────────────────────

-- Aéroport: score très élevé (pic matin/soir, courses longues)
UPDATE public.zones SET
  territory    = 'montreal',
  base_score   = 82,
  current_score = 82
WHERE id = 'mtl-yul';

-- Gare Centrale: élevé (business, intercités)
UPDATE public.zones SET
  territory    = 'montreal',
  base_score   = 74,
  current_score = 74
WHERE id = 'mtl-gc';

-- Berri-UQAM: hub métro, très achalandé
UPDATE public.zones SET
  territory    = 'montreal',
  base_score   = 71,
  current_score = 71
WHERE id = 'mtl-bq';

-- Lionel-Groulx: carrefour orange/verte, fort transit
UPDATE public.zones SET
  territory    = 'montreal',
  base_score   = 65,
  current_score = 65
WHERE id = 'mtl-ll';

-- Jean-Talon: bon marché, résidentiel dense
UPDATE public.zones SET
  territory    = 'montreal',
  base_score   = 58,
  current_score = 58
WHERE id = 'mtl-jt';

-- Côte-Vertu: terminus, correspondances bus
UPDATE public.zones SET
  territory    = 'montreal',
  base_score   = 55,
  current_score = 55
WHERE id = 'mtl-cv';

-- Quartier des spectacles: nightlife premium
UPDATE public.zones SET
  territory    = 'montreal',
  base_score   = 77,
  current_score = 77
WHERE id = 'mtl-qs';

-- Crescent/Ste-Catherine: bars, restaurants, peak nocturne
UPDATE public.zones SET
  territory    = 'montreal',
  base_score   = 73,
  current_score = 73
WHERE id = 'mtl-cs';

-- Vieux-Port: tourisme, Uber Eats fort
UPDATE public.zones SET
  territory    = 'montreal',
  base_score   = 68,
  current_score = 68
WHERE id = 'mtl-vp';

-- Centre Bell: peak événements → score événementiel fort
UPDATE public.zones SET
  territory    = 'montreal',
  base_score   = 79,
  current_score = 79
WHERE id = 'mtl-cb';

-- Stade olympique: événements ponctuels, moyen hors événement
UPDATE public.zones SET
  territory    = 'montreal',
  base_score   = 52,
  current_score = 52
WHERE id = 'mtl-so';

-- Rockland: commercial suburban, peak weekend
UPDATE public.zones SET
  territory    = 'montreal',
  base_score   = 48,
  current_score = 48
WHERE id = 'mtl-rk';

-- Marché Jean-Talon: commercial local, matins fort
UPDATE public.zones SET
  territory    = 'montreal',
  base_score   = 51,
  current_score = 51
WHERE id = 'mtl-mj';

-- CHUM: médical, régulier, courses courtes
UPDATE public.zones SET
  territory    = 'montreal',
  base_score   = 60,
  current_score = 60
WHERE id = 'mtl-ch';

-- McGill: université, peak jour semaine
UPDATE public.zones SET
  territory    = 'montreal',
  base_score   = 62,
  current_score = 62
WHERE id = 'mtl-mg';

-- UQAM: université, centre-ville, bon
UPDATE public.zones SET
  territory    = 'montreal',
  base_score   = 63,
  current_score = 63
WHERE id = 'mtl-uq';

-- Plaza Saint-Hubert: commercial de quartier
UPDATE public.zones SET
  territory    = 'montreal',
  base_score   = 45,
  current_score = 45
WHERE id = 'mtl-ph';

-- Mont-Royal: résidentiel branché, brunch peak
UPDATE public.zones SET
  territory    = 'montreal',
  base_score   = 57,
  current_score = 57
WHERE id = 'mtl-mr';

-- Casino de Montréal: nightlife tardive, nuits fort
UPDATE public.zones SET
  territory    = 'montreal',
  base_score   = 69,
  current_score = 69
WHERE id = 'mtl-ca';

-- ── LAVAL ───────────────────────────────────────────────────────────────

-- Station Montmorency: terminus métro Laval, très achalandé
UPDATE public.zones SET
  territory    = 'laval',
  base_score   = 70,
  current_score = 70
WHERE id = 'lvl-mm';

-- Station Cartier: métro Laval intermédiaire
UPDATE public.zones SET
  territory    = 'laval',
  base_score   = 58,
  current_score = 58
WHERE id = 'lvl-ct';

-- Station De La Concorde: métro Laval sud
UPDATE public.zones SET
  territory    = 'laval',
  base_score   = 55,
  current_score = 55
WHERE id = 'lvl-dc';

-- Carrefour Laval: plus grand centre commercial QC, peak weekend
UPDATE public.zones SET
  territory    = 'laval',
  base_score   = 66,
  current_score = 66
WHERE id = 'lvl-cl';

-- Centropolis: nightlife Laval, restaurants
UPDATE public.zones SET
  territory    = 'laval',
  base_score   = 62,
  current_score = 62
WHERE id = 'lvl-cp';

-- Place Laval: commercial
UPDATE public.zones SET
  territory    = 'laval',
  base_score   = 50,
  current_score = 50
WHERE id = 'lvl-pl';

-- Hôpital Cité-de-la-Santé: médical, régulier
UPDATE public.zones SET
  territory    = 'laval',
  base_score   = 54,
  current_score = 54
WHERE id = 'lvl-hp';

-- Cégep Montmorency: université, semaine
UPDATE public.zones SET
  territory    = 'laval',
  base_score   = 47,
  current_score = 47
WHERE id = 'lvl-cm';

-- UdeM Laval: campus secondaire
UPDATE public.zones SET
  territory    = 'laval',
  base_score   = 44,
  current_score = 44
WHERE id = 'lvl-um';

-- Gare Sainte-Rose: extrême nord, faible densité
UPDATE public.zones SET
  territory    = 'laval',
  base_score   = 35,
  current_score = 35
WHERE id = 'lvl-gs';

-- Place Bell: événements (concerts, Rocket IHL)
UPDATE public.zones SET
  territory    = 'laval',
  base_score   = 67,
  current_score = 67
WHERE id = 'lvl-pb';

-- ── LONGUEUIL / RIVE-SUD ────────────────────────────────────────────────

-- Station Longueuil: métro + bus, porte Rive-Sud fort
UPDATE public.zones SET
  territory    = 'longueuil',
  base_score   = 72,
  current_score = 72
WHERE id = 'lng-us';

-- Terminus Longueuil: adjacent à la station
UPDATE public.zones SET
  territory    = 'longueuil',
  base_score   = 68,
  current_score = 68
WHERE id = 'lng-tl';

-- Mail Champlain: grand commercial Rive-Sud
UPDATE public.zones SET
  territory    = 'longueuil',
  base_score   = 56,
  current_score = 56
WHERE id = 'lng-mc';

-- Place Longueuil: commercial centre-ville
UPDATE public.zones SET
  territory    = 'longueuil',
  base_score   = 52,
  current_score = 52
WHERE id = 'lng-pl';

-- Hôpital Charles-Le Moyne: médical, régulier
UPDATE public.zones SET
  territory    = 'longueuil',
  base_score   = 57,
  current_score = 57
WHERE id = 'lng-hc';

-- Vieux-Longueuil: résidentiel, modéré
UPDATE public.zones SET
  territory    = 'longueuil',
  base_score   = 43,
  current_score = 43
WHERE id = 'lng-vl';

-- Cégep Édouard-Montpetit: université, semaine
UPDATE public.zones SET
  territory    = 'longueuil',
  base_score   = 45,
  current_score = 45
WHERE id = 'lng-em';

-- UdeS Longueuil: campus, modéré
UPDATE public.zones SET
  territory    = 'longueuil',
  base_score   = 44,
  current_score = 44
WHERE id = 'lng-us2';

-- Promenades Saint-Bruno: commercial excentré, peak weekend
UPDATE public.zones SET
  territory    = 'longueuil',
  base_score   = 49,
  current_score = 49
WHERE id = 'lng-psb';

-- Gare Brossard REM: REM terminus, fort potentiel
UPDATE public.zones SET
  territory    = 'longueuil',
  base_score   = 64,
  current_score = 64
WHERE id = 'lng-rem';

-- ── Vérification finale ──────────────────────────────────────────────────
-- SELECT id, territory, base_score, current_score FROM public.zones ORDER BY territory, base_score DESC;
