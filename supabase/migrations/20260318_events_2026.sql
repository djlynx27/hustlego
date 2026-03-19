-- ── Calendrier événements Montréal 2026 ────────────────────────────────────
-- Plan révolutionnaire HustleGo — Section 7 : Données spécifiques Montréal
-- Tous les UUID commencent par 'e2026000-' pour éviter les conflits avec le seed.
-- Couvre Igloofest → Pride 2026 + matchs Canadiens clés + événements récurrents.

-- Ajout idempotent : ON CONFLICT DO NOTHING

INSERT INTO public.events (
  id, name, venue, city_id,
  latitude, longitude,
  start_at, end_at,
  capacity, demand_impact, boost_multiplier, boost_radius_km,
  boost_zone_types, category, is_holiday
) VALUES

  -- ══════════════════════════════════════════════════════════════
  --  IGLOOFEST (4 weekends — jan/fév 2026)
  -- ══════════════════════════════════════════════════════════════
  ('e2026000-0001-0001-0001-000000000001',
   'Igloofest — Weekend 1 (Vendredi)', 'Vieux-Port de Montréal', 'mtl',
   45.5048, -73.5547,
   '2026-01-16 03:00:00+00', '2026-01-17 07:00:00+00',
   8000, 5, 2.8, 3.5,
   ARRAY['nightlife','tourisme','commercial'], 'festival', false),

  ('e2026000-0001-0001-0001-000000000002',
   'Igloofest — Weekend 1 (Samedi)', 'Vieux-Port de Montréal', 'mtl',
   45.5048, -73.5547,
   '2026-01-17 03:00:00+00', '2026-01-18 07:00:00+00',
   10000, 5, 3.0, 3.5,
   ARRAY['nightlife','tourisme','commercial'], 'festival', false),

  ('e2026000-0001-0001-0002-000000000001',
   'Igloofest — Weekend 2 (Vendredi)', 'Vieux-Port de Montréal', 'mtl',
   45.5048, -73.5547,
   '2026-01-23 03:00:00+00', '2026-01-24 07:00:00+00',
   8000, 5, 2.8, 3.5,
   ARRAY['nightlife','tourisme','commercial'], 'festival', false),

  ('e2026000-0001-0001-0002-000000000002',
   'Igloofest — Weekend 2 (Samedi)', 'Vieux-Port de Montréal', 'mtl',
   45.5048, -73.5547,
   '2026-01-24 03:00:00+00', '2026-01-25 07:00:00+00',
   10000, 5, 3.0, 3.5,
   ARRAY['nightlife','tourisme','commercial'], 'festival', false),

  ('e2026000-0001-0001-0003-000000000001',
   'Igloofest — Weekend 3 (Vendredi)', 'Vieux-Port de Montréal', 'mtl',
   45.5048, -73.5547,
   '2026-01-30 03:00:00+00', '2026-01-31 07:00:00+00',
   8000, 5, 2.8, 3.5,
   ARRAY['nightlife','tourisme','commercial'], 'festival', false),

  ('e2026000-0001-0001-0003-000000000002',
   'Igloofest — Weekend 3 (Samedi)', 'Vieux-Port de Montréal', 'mtl',
   45.5048, -73.5547,
   '2026-01-31 03:00:00+00', '2026-02-01 07:00:00+00',
   10000, 5, 3.0, 3.5,
   ARRAY['nightlife','tourisme','commercial'], 'festival', false),

  ('e2026000-0001-0001-0004-000000000001',
   'Igloofest — Weekend 4 (Vendredi)', 'Vieux-Port de Montréal', 'mtl',
   45.5048, -73.5547,
   '2026-02-06 03:00:00+00', '2026-02-07 07:00:00+00',
   8000, 5, 2.8, 3.5,
   ARRAY['nightlife','tourisme','commercial'], 'festival', false),

  ('e2026000-0001-0001-0004-000000000002',
   'Igloofest — Weekend 4 (Samedi)', 'Vieux-Port de Montréal', 'mtl',
   45.5048, -73.5547,
   '2026-02-07 03:00:00+00', '2026-02-08 07:00:00+00',
   10000, 5, 3.0, 3.5,
   ARRAY['nightlife','tourisme','commercial'], 'festival', false),

  -- ══════════════════════════════════════════════════════════════
  --  MONTRÉAL EN LUMIÈRE (27 fév – 7 mars)
  -- ══════════════════════════════════════════════════════════════
  ('e2026000-0002-0001-0001-000000000001',
   'Montréal en Lumière — Soirée d''ouverture', 'Quartier des spectacles', 'mtl',
   45.5090, -73.5618,
   '2026-02-28 00:00:00+00', '2026-02-28 05:00:00+00',
   20000, 4, 2.2, 4.0,
   ARRAY['nightlife','commercial','tourisme','événements'], 'festival', false),

  ('e2026000-0002-0001-0002-000000000001',
   'Nuit Blanche Montréal 2026', 'Centre-ville (partout)', 'mtl',
   45.5048, -73.5741,
   '2026-02-28 05:00:00+00', '2026-02-28 11:00:00+00',
   50000, 5, 3.5, 6.0,
   ARRAY['nightlife','commercial','tourisme','événements','métro'], 'festival', false),

  ('e2026000-0002-0001-0003-000000000001',
   'Montréal en Lumière — Clôture', 'Quartier des spectacles', 'mtl',
   45.5090, -73.5618,
   '2026-03-07 01:00:00+00', '2026-03-08 05:00:00+00',
   15000, 4, 2.0, 3.5,
   ARRAY['nightlife','commercial','tourisme'], 'festival', false),

  -- ══════════════════════════════════════════════════════════════
  --  GRAND PRIX DE FORMULE 1 (22-24 mai)
  --  ~350 000 personnes, événement le plus important de l'année
  -- ══════════════════════════════════════════════════════════════
  ('e2026000-0003-0001-0001-000000000001',
   'Grand Prix F1 — Qualifications (Samedi)', 'Circuit Gilles-Villeneuve', 'mtl',
   45.5000, -73.5228,
   '2026-05-23 15:00:00+00', '2026-05-23 22:00:00+00',
   100000, 5, 3.5, 5.0,
   ARRAY['transport','événements','commercial','tourisme'], 'sport', false),

  ('e2026000-0003-0001-0001-000000000002',
   'Grand Prix F1 — Soirée qualifications', 'Centre-ville / Crescent', 'mtl',
   45.4990, -73.5830,
   '2026-05-23 22:00:00+00', '2026-05-24 04:00:00+00',
   50000, 5, 3.5, 5.0,
   ARRAY['nightlife','commercial','tourisme'], 'sport', false),

  ('e2026000-0003-0001-0002-000000000001',
   'Grand Prix F1 — Course (Dimanche)', 'Circuit Gilles-Villeneuve', 'mtl',
   45.5000, -73.5228,
   '2026-05-24 18:00:00+00', '2026-05-24 21:00:00+00',
   130000, 5, 4.0, 6.0,
   ARRAY['transport','événements','commercial','tourisme','aéroport'], 'sport', false),

  ('e2026000-0003-0001-0002-000000000002',
   'Grand Prix F1 — Après-course (Dimanche soir)', 'Centre-ville / Crescent', 'mtl',
   45.4990, -73.5830,
   '2026-05-24 21:00:00+00', '2026-05-25 05:00:00+00',
   80000, 5, 4.0, 6.0,
   ARRAY['nightlife','commercial','tourisme','aéroport'], 'sport', false),

  -- ══════════════════════════════════════════════════════════════
  --  FESTIVAL FRANCOS (12-20 juin)
  -- ══════════════════════════════════════════════════════════════
  ('e2026000-0004-0001-0001-000000000001',
   'Francos de Montréal — Ouverture', 'Quartier des spectacles', 'mtl',
   45.5090, -73.5618,
   '2026-06-12 22:00:00+00', '2026-06-13 03:00:00+00',
   12000, 4, 2.2, 3.5,
   ARRAY['nightlife','commercial','tourisme','événements'], 'festival', false),

  ('e2026000-0004-0001-0001-000000000002',
   'Francos — Soirée mi-festival', 'Quartier des spectacles', 'mtl',
   45.5090, -73.5618,
   '2026-06-16 22:00:00+00', '2026-06-17 03:00:00+00',
   15000, 4, 2.3, 3.5,
   ARRAY['nightlife','commercial','tourisme','événements'], 'festival', false),

  ('e2026000-0004-0001-0001-000000000003',
   'Francos — Soirée de clôture', 'Quartier des spectacles', 'mtl',
   45.5090, -73.5618,
   '2026-06-20 22:00:00+00', '2026-06-21 03:00:00+00',
   20000, 5, 2.5, 4.0,
   ARRAY['nightlife','commercial','tourisme','événements'], 'festival', false),

  -- ══════════════════════════════════════════════════════════════
  --  FESTIVAL INTERNATIONAL DE JAZZ (25 juin – 4 juillet)
  --  ~2 millions de personnes sur 10 jours
  -- ══════════════════════════════════════════════════════════════
  ('e2026000-0005-0001-0001-000000000001',
   'Jazz Festival — Premiers jours (25-27 juin)', 'Quartier des spectacles', 'mtl',
   45.5090, -73.5618,
   '2026-06-25 22:00:00+00', '2026-06-28 03:00:00+00',
   40000, 5, 2.8, 4.5,
   ARRAY['nightlife','commercial','tourisme','événements'], 'festival', false),

  ('e2026000-0005-0001-0001-000000000002',
   'Jazz Festival — Weekend 1 (27-28 juin)', 'Quartier des spectacles', 'mtl',
   45.5090, -73.5618,
   '2026-06-27 20:00:00+00', '2026-06-29 04:00:00+00',
   60000, 5, 3.2, 5.0,
   ARRAY['nightlife','commercial','tourisme','événements'], 'festival', false),

  ('e2026000-0005-0001-0001-000000000003',
   'Jazz Festival — Weekend 2 (4-5 juillet)', 'Quartier des spectacles', 'mtl',
   45.5090, -73.5618,
   '2026-07-04 20:00:00+00', '2026-07-05 05:00:00+00',
   70000, 5, 3.5, 5.0,
   ARRAY['nightlife','commercial','tourisme','événements'], 'festival', false),

  -- ══════════════════════════════════════════════════════════════
  --  CIRQUE DU SOLEIL — MONTRÉAL (2-12 juillet)
  -- ══════════════════════════════════════════════════════════════
  ('e2026000-0006-0001-0001-000000000001',
   'Cirque du Soleil — Fin de semaine ouverture', 'TOHU / Cirque', 'mtl',
   45.5542, -73.6228,
   '2026-07-04 22:00:00+00', '2026-07-05 02:00:00+00',
   5000, 3, 1.8, 2.5,
   ARRAY['tourisme','événements'], 'event', false),

  -- ══════════════════════════════════════════════════════════════
  --  NUITS D''AFRIQUE (7-19 juillet)
  -- ══════════════════════════════════════════════════════════════
  ('e2026000-0007-0001-0001-000000000001',
   'Nuits d''Afrique — Fin de semaine centrale', 'Quartier des spectacles', 'mtl',
   45.5090, -73.5618,
   '2026-07-11 21:00:00+00', '2026-07-12 04:00:00+00',
   12000, 4, 2.2, 3.5,
   ARRAY['nightlife','commercial','tourisme','événements'], 'festival', false),

  ('e2026000-0007-0001-0001-000000000002',
   'Nuits d''Afrique — Clôture', 'Quartier des spectacles', 'mtl',
   45.5090, -73.5618,
   '2026-07-18 21:00:00+00', '2026-07-19 04:00:00+00',
   15000, 4, 2.3, 3.5,
   ARRAY['nightlife','commercial','tourisme','événements'], 'festival', false),

  -- ══════════════════════════════════════════════════════════════
  --  JUST FOR LAUGHS (15-26 juillet)
  --  ~2 millions de personnes — événement majeur
  -- ══════════════════════════════════════════════════════════════
  ('e2026000-0008-0001-0001-000000000001',
   'Just for Laughs — Ouverture', 'Quartier des spectacles + multi-salles', 'mtl',
   45.5090, -73.5618,
   '2026-07-15 22:00:00+00', '2026-07-16 03:00:00+00',
   20000, 5, 2.8, 4.5,
   ARRAY['nightlife','commercial','tourisme','événements'], 'festival', false),

  ('e2026000-0008-0001-0001-000000000002',
   'Just for Laughs — Weekend 1 (17-18 juillet)', 'Quartier des spectacles', 'mtl',
   45.5090, -73.5618,
   '2026-07-17 21:00:00+00', '2026-07-19 04:00:00+00',
   40000, 5, 3.0, 5.0,
   ARRAY['nightlife','commercial','tourisme','événements'], 'festival', false),

  ('e2026000-0008-0001-0001-000000000003',
   'Just for Laughs — Weekend 2 / Clôture (24-26 juillet)', 'Quartier des spectacles', 'mtl',
   45.5090, -73.5618,
   '2026-07-24 21:00:00+00', '2026-07-27 04:00:00+00',
   50000, 5, 3.2, 5.0,
   ARRAY['nightlife','commercial','tourisme','événements'], 'festival', false),

  -- ══════════════════════════════════════════════════════════════
  --  OSHEAGA (31 juil – 2 août) — 45 000+/jour
  -- ══════════════════════════════════════════════════════════════
  ('e2026000-0009-0001-0001-000000000001',
   'Osheaga — Jour 1 (Vendredi)', 'Parc Jean-Drapeau', 'mtl',
   45.5102, -73.5322,
   '2026-07-31 15:00:00+00', '2026-08-01 03:00:00+00',
   45000, 5, 3.5, 5.5,
   ARRAY['événements','transport','tourisme','nightlife'], 'festival', false),

  ('e2026000-0009-0001-0001-000000000002',
   'Osheaga — Jour 2 (Samedi)', 'Parc Jean-Drapeau', 'mtl',
   45.5102, -73.5322,
   '2026-08-01 14:00:00+00', '2026-08-02 04:00:00+00',
   50000, 5, 3.8, 5.5,
   ARRAY['événements','transport','tourisme','nightlife'], 'festival', false),

  ('e2026000-0009-0001-0001-000000000003',
   'Osheaga — Jour 3 (Dimanche)', 'Parc Jean-Drapeau', 'mtl',
   45.5102, -73.5322,
   '2026-08-02 14:00:00+00', '2026-08-02 23:00:00+00',
   45000, 5, 3.5, 5.5,
   ARRAY['événements','transport','tourisme'], 'festival', false),

  -- ══════════════════════════════════════════════════════════════
  --  ÎLESONIQ (8-9 août)
  -- ══════════════════════════════════════════════════════════════
  ('e2026000-0010-0001-0001-000000000001',
   'ÎleSoniq — Jour 1 (Samedi)', 'Parc Jean-Drapeau', 'mtl',
   45.5102, -73.5322,
   '2026-08-08 14:00:00+00', '2026-08-09 05:00:00+00',
   35000, 5, 3.2, 5.0,
   ARRAY['événements','transport','nightlife','tourisme'], 'festival', false),

  ('e2026000-0010-0001-0001-000000000002',
   'ÎleSoniq — Jour 2 (Dimanche)', 'Parc Jean-Drapeau', 'mtl',
   45.5102, -73.5322,
   '2026-08-09 14:00:00+00', '2026-08-09 23:00:00+00',
   35000, 5, 3.0, 5.0,
   ARRAY['événements','transport','tourisme'], 'festival', false),

  -- ══════════════════════════════════════════════════════════════
  --  HEAVY MONTRÉAL (9-10 août)
  -- ══════════════════════════════════════════════════════════════
  ('e2026000-0011-0001-0001-000000000001',
   'Heavy Montréal — Jour 1', 'Parc Jean-Drapeau', 'mtl',
   45.5102, -73.5322,
   '2026-08-09 17:00:00+00', '2026-08-10 03:00:00+00',
   25000, 4, 2.8, 4.5,
   ARRAY['événements','transport','nightlife'], 'festival', false),

  ('e2026000-0011-0001-0001-000000000002',
   'Heavy Montréal — Jour 2', 'Parc Jean-Drapeau', 'mtl',
   45.5102, -73.5322,
   '2026-08-10 17:00:00+00', '2026-08-10 23:59:00+00',
   25000, 4, 2.8, 4.5,
   ARRAY['événements','transport'], 'festival', false),

  -- ══════════════════════════════════════════════════════════════
  --  FIERTÉ MONTRÉAL / PRIDE (mi-août, ~16-23 août)
  -- ══════════════════════════════════════════════════════════════
  ('e2026000-0012-0001-0001-000000000001',
   'Fierté Montréal — Défilé & Festival', 'Village / Centre-ville', 'mtl',
   45.5163, -73.5543,
   '2026-08-16 15:00:00+00', '2026-08-17 05:00:00+00',
   150000, 5, 3.5, 6.0,
   ARRAY['nightlife','commercial','tourisme','événements','résidentiel'], 'festival', false),

  ('e2026000-0012-0001-0001-000000000002',
   'Fierté Montréal — Soirée Grande Place', 'Village / Ste-Catherine', 'mtl',
   45.5163, -73.5543,
   '2026-08-22 21:00:00+00', '2026-08-23 05:00:00+00',
   100000, 5, 3.5, 5.5,
   ARRAY['nightlife','commercial','tourisme','événements'], 'festival', false),

  -- ══════════════════════════════════════════════════════════════
  --  MATCHS CANADIENS — SAISON 2025-26 (clés, à domicile)
  --  Centre Bell: 45.4957, -73.5693
  --  Les matchs commencent ~19h locales = 23h UTC (hiver) ou 23h UTC (été)
  -- ══════════════════════════════════════════════════════════════
  ('e2026000-0013-0001-0001-000000000001',
   'Canadiens de Montréal — Match des séries (Playoffs)', 'Centre Bell', 'mtl',
   45.4957, -73.5693,
   '2026-04-20 23:00:00+00', '2026-04-21 02:30:00+00',
   21288, 5, 2.8, 3.5,
   ARRAY['nightlife','commercial','événements'], 'hockey', false),

  ('e2026000-0013-0001-0001-000000000002',
   'Canadiens — Playoff Round 2 (Match domicile)', 'Centre Bell', 'mtl',
   45.4957, -73.5693,
   '2026-05-05 22:00:00+00', '2026-05-06 02:30:00+00',
   21288, 5, 3.0, 3.5,
   ARRAY['nightlife','commercial','événements'], 'hockey', false),

  -- ══════════════════════════════════════════════════════════════
  --  FÊTES NATIONALES ET FÉRIÉS
  -- ══════════════════════════════════════════════════════════════
  ('e2026000-0014-0001-0001-000000000001',
   'Saint-Jean-Baptiste — Fête nationale', 'Partout à Montréal', 'mtl',
   45.5090, -73.5618,
   '2026-06-24 23:00:00+00', '2026-06-25 05:00:00+00',
   200000, 5, 3.8, 8.0,
   ARRAY['nightlife','commercial','tourisme','événements','résidentiel','métro'], 'holiday', true),

  ('e2026000-0014-0001-0002-000000000001',
   'Fête du Canada (1er juillet)', 'Vieux-Port + Centre-ville', 'mtl',
   45.5048, -73.5547,
   '2026-07-01 19:00:00+00', '2026-07-02 02:00:00+00',
   80000, 4, 3.0, 6.0,
   ARRAY['tourisme','commercial','événements','nightlife'], 'holiday', true),

  ('e2026000-0014-0001-0003-000000000001',
   'Action de Grâces (Lundi férié)', 'Montréal', 'mtl',
   45.5017, -73.5673,
   '2026-10-12 12:00:00+00', '2026-10-12 23:00:00+00',
   0, 2, 1.5, 3.0,
   ARRAY[]::TEXT[], 'holiday', true),

  ('e2026000-0014-0001-0004-000000000001',
   'Halloween — Fermeture bars/fêtes', 'Crescent / St-Laurent / Village', 'mtl',
   45.5083, -73.5735,
   '2026-11-01 04:00:00+00', '2026-11-01 07:00:00+00',
   50000, 5, 3.5, 5.0,
   ARRAY['nightlife','commercial'], 'event', false),

  -- ══════════════════════════════════════════════════════════════
  --  LAVAL — ÉVÉNEMENTS PLACE BELL
  -- ══════════════════════════════════════════════════════════════
  ('e2026000-0020-0001-0001-000000000001',
   'Laval — Concert majeur Place Bell (Été)', 'Place Bell', 'lvl',
   45.5476, -73.7479,
   '2026-07-18 22:00:00+00', '2026-07-19 02:00:00+00',
   10000, 4, 2.2, 2.5,
   ARRAY['événements','nightlife','commercial'], 'event', false),

  ('e2026000-0020-0001-0001-000000000002',
   'Laval — Série éliminatoire Rocket (si applicable)', 'Place Bell', 'lvl',
   45.5476, -73.7479,
   '2026-05-08 22:00:00+00', '2026-05-09 02:00:00+00',
   10100, 4, 2.0, 2.5,
   ARRAY['événements','nightlife','commercial'], 'hockey', false)

ON CONFLICT (id) DO NOTHING;
