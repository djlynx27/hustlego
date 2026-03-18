-- ============================================================
-- Migration: Données réelles HustleGo (générée automatiquement)
-- Source: zones bubble.csv + QuickBooks_Mileage.csv
-- ============================================================

-- ── Création des tables (si elles n'existent pas encore) ────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'zone_type') THEN
    CREATE TYPE zone_type AS ENUM (
      'métro', 'commercial', 'résidentiel', 'nightlife',
      'aéroport', 'transport', 'médical', 'université',
      'événements', 'tourisme'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS cities (
  id         text PRIMARY KEY,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS zones (
  id            text PRIMARY KEY,
  city_id       text NOT NULL REFERENCES cities(id),
  name          text NOT NULL,
  type          zone_type NOT NULL DEFAULT 'commercial',
  latitude      double precision NOT NULL,
  longitude     double precision NOT NULL,
  base_score    int,
  current_score int,
  address       text,
  category      text,
  territory     text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_reports (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date        date NOT NULL UNIQUE,
  total_trips        int,
  total_distance_km  numeric,
  hours_worked       numeric,
  total_earnings     numeric,
  dead_time_pct      int,
  best_zone_name     text,
  worst_zone_name    text,
  best_time_slot     text,
  ai_recommendation  text,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  venue             text NOT NULL,
  city_id           text NOT NULL REFERENCES cities(id),
  latitude          double precision NOT NULL,
  longitude         double precision NOT NULL,
  start_at          timestamptz NOT NULL,
  end_at            timestamptz NOT NULL,
  capacity          int NOT NULL DEFAULT 0,
  demand_impact     int NOT NULL DEFAULT 1,
  boost_multiplier  numeric NOT NULL DEFAULT 1.0,
  boost_radius_km   numeric NOT NULL DEFAULT 1.0,
  boost_zone_types  text[] NOT NULL DEFAULT '{}',
  category          text NOT NULL DEFAULT 'event',
  is_holiday        boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ── Villes ──────────────────────────────────────────────────
INSERT INTO cities (id, name) VALUES
  ('mtl', 'Montréal'),
  ('lvl', 'Laval'),
  ('lng', 'Longueuil')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ── Zones (coordonnées GPS réelles) ─────────────────────────
INSERT INTO zones (id, city_id, name, type, latitude, longitude) VALUES
  ('mtl-yul', 'mtl', 'Aéroport Trudeau (YUL)', 'aéroport', 45.4706, -73.7408),
  ('mtl-gc', 'mtl', 'Gare Centrale', 'transport', 45.4994, -73.5685),
  ('mtl-bq', 'mtl', 'Station Berri-UQAM', 'métro', 45.5163, -73.5694),
  ('mtl-ll', 'mtl', 'Station Lionel-Groulx', 'métro', 45.4734, -73.5773),
  ('mtl-jt', 'mtl', 'Station Jean-Talon', 'métro', 45.5353, -73.6238),
  ('mtl-cv', 'mtl', 'Station Côte-Vertu', 'métro', 45.5058, -73.7438),
  ('mtl-qs', 'mtl', 'Quartier des spectacles', 'nightlife', 45.5088, -73.5603),
  ('mtl-cs', 'mtl', 'Crescent Sainte-Catherine', 'nightlife', 45.4985, -73.5795),
  ('mtl-vp', 'mtl', 'Vieux-Port de Montréal', 'tourisme', 45.5088, -73.554),
  ('mtl-cb', 'mtl', 'Centre Bell', 'événements', 45.496, -73.5694),
  ('mtl-so', 'mtl', 'Stade olympique', 'événements', 45.5597, -73.5515),
  ('mtl-rk', 'mtl', 'Centre commercial Rockland', 'commercial', 45.4942, -73.662),
  ('mtl-mj', 'mtl', 'Marché Jean-Talon', 'commercial', 45.5349, -73.6148),
  ('mtl-ch', 'mtl', 'CHUM Hôpital', 'médical', 45.511, -73.556),
  ('mtl-mg', 'mtl', 'Université McGill', 'université', 45.5048, -73.5772),
  ('mtl-uq', 'mtl', 'UQAM', 'université', 45.5094, -73.5688),
  ('mtl-ph', 'mtl', 'Plaza Saint-Hubert', 'commercial', 45.5402, -73.5845),
  ('mtl-mr', 'mtl', 'Avenue Mont-Royal', 'résidentiel', 45.5268, -73.585),
  ('mtl-ca', 'mtl', 'Casino de Montréal', 'nightlife', 45.5095, -73.5296),
  ('lvl-mm', 'lvl', 'Station Montmorency', 'métro', 45.5585, -73.7114),
  ('lvl-ct', 'lvl', 'Station Cartier', 'métro', 45.5503, -73.7006),
  ('lvl-dc', 'lvl', 'Station De La Concorde', 'métro', 45.5446, -73.6936),
  ('lvl-cl', 'lvl', 'Carrefour Laval', 'commercial', 45.5578, -73.7453),
  ('lvl-cp', 'lvl', 'Centropolis Laval', 'nightlife', 45.5572, -73.7468),
  ('lvl-pl', 'lvl', 'Place Laval', 'commercial', 45.5422, -73.7167),
  ('lvl-hp', 'lvl', 'Hôpital Cité-de-la-Santé', 'médical', 45.5535, -73.7528),
  ('lvl-cm', 'lvl', 'Cégep Montmorency', 'université', 45.5592, -73.7118),
  ('lvl-um', 'lvl', 'Université de Montréal Laval', 'université', 45.5718, -73.735),
  ('lvl-gs', 'lvl', 'Gare Sainte-Rose', 'transport', 45.6049, -73.7698),
  ('lvl-pb', 'lvl', 'Place Bell', 'événements', 45.5569, -73.7465),
  ('lng-us', 'lng', 'Station Longueuil U. Sherbrooke', 'métro', 45.5252, -73.5205),
  ('lng-tl', 'lng', 'Terminus Longueuil', 'transport', 45.5254, -73.5198),
  ('lng-mc', 'lng', 'Mail Champlain', 'commercial', 45.5001, -73.4998),
  ('lng-pl', 'lng', 'Place Longueuil', 'commercial', 45.5255, -73.5176),
  ('lng-hc', 'lng', 'Hôpital Charles-Le Moyne', 'médical', 45.5223, -73.5068),
  ('lng-vl', 'lng', 'Vieux-Longueuil', 'résidentiel', 45.5311, -73.5066),
  ('lng-em', 'lng', 'Cégep Édouard-Montpetit', 'université', 45.4991, -73.5053),
  ('lng-us2', 'lng', 'Université de Sherbrooke Longueuil', 'université', 45.4998, -73.5045),
  ('lng-psb', 'lng', 'Promenades Saint-Bruno', 'commercial', 45.5311, -73.3581),
  ('lng-rem', 'lng', 'Gare Brossard REM', 'transport', 45.4582, -73.4718)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, type = EXCLUDED.type,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;

-- ── Rapports journaliers (données réelles QuickBooks fév-mars 2026) ──
INSERT INTO daily_reports (id, report_date, total_trips, total_distance_km, hours_worked, total_earnings, dead_time_pct, ai_recommendation) VALUES
  (gen_random_uuid(), '2026-02-05', 3, 132.9, 5.3, 248.23, 18, 'Journée légère — cible les stations de métro et l''aéroport.'),
  (gen_random_uuid(), '2026-02-06', 5, 226.6, 9.1, 422.88, 12, 'Bonne performance — concentre-toi sur les heures de pointe.'),
  (gen_random_uuid(), '2026-02-07', 3, 157.3, 6.3, 292.05, 24, 'Bonne performance — concentre-toi sur les heures de pointe.'),
  (gen_random_uuid(), '2026-02-08', 6, 360.8, 14.4, 667.4, 10, 'Excellente journée — continue sur ta lancée!'),
  (gen_random_uuid(), '2026-02-09', 6, 197.1, 7.9, 372.86, 13, 'Bonne performance — concentre-toi sur les heures de pointe.'),
  (gen_random_uuid(), '2026-02-10', 7, 248, 9.9, 467.36, 23, 'Bonne performance — concentre-toi sur les heures de pointe.'),
  (gen_random_uuid(), '2026-02-11', 3, 184, 7.4, 340.16, 28, 'Bonne performance — concentre-toi sur les heures de pointe.'),
  (gen_random_uuid(), '2026-02-12', 5, 213, 8.5, 398.31, 13, 'Bonne performance — concentre-toi sur les heures de pointe.'),
  (gen_random_uuid(), '2026-02-13', 5, 172.8, 6.9, 326.13, 16, 'Bonne performance — concentre-toi sur les heures de pointe.'),
  (gen_random_uuid(), '2026-02-14', 9, 259.3, 10.4, 493.78, 20, 'Excellente journée — continue sur ta lancée!'),
  (gen_random_uuid(), '2026-02-15', 6, 171, 6.8, 325.82, 12, 'Bonne performance — concentre-toi sur les heures de pointe.'),
  (gen_random_uuid(), '2026-02-16', 6, 254.3, 10.2, 475.72, 18, 'Excellente journée — continue sur ta lancée!'),
  (gen_random_uuid(), '2026-02-17', 7, 258.4, 10.3, 486.18, 28, 'Excellente journée — continue sur ta lancée!'),
  (gen_random_uuid(), '2026-02-18', 6, 305, 12.2, 566.93, 22, 'Excellente journée — continue sur ta lancée!'),
  (gen_random_uuid(), '2026-02-19', 9, 154.3, 6.2, 304.78, 24, 'Bonne performance — concentre-toi sur les heures de pointe.'),
  (gen_random_uuid(), '2026-02-20', 8, 319.4, 12.8, 598.85, 30, 'Excellente journée — continue sur ta lancée!'),
  (gen_random_uuid(), '2026-02-21', 7, 319.5, 12.8, 596.14, 14, 'Excellente journée — continue sur ta lancée!'),
  (gen_random_uuid(), '2026-02-22', 6, 135, 5.4, 261.06, 27, 'Journée légère — cible les stations de métro et l''aéroport.'),
  (gen_random_uuid(), '2026-02-23', 6, 253.2, 10.1, 473.8, 24, 'Excellente journée — continue sur ta lancée!'),
  (gen_random_uuid(), '2026-02-24', 6, 174.8, 7, 332.57, 14, 'Bonne performance — concentre-toi sur les heures de pointe.'),
  (gen_random_uuid(), '2026-02-25', 6, 121.9, 4.9, 237.43, 15, 'Journée légère — cible les stations de métro et l''aéroport.'),
  (gen_random_uuid(), '2026-02-26', 4, 5, 0.2, 21.07, 24, 'Journée légère — cible les stations de métro et l''aéroport.'),
  (gen_random_uuid(), '2026-02-27', 6, 100, 4, 198, 23, 'Journée légère — cible les stations de métro et l''aéroport.'),
  (gen_random_uuid(), '2026-02-28', 5, 157.4, 6.3, 298.33, 11, 'Bonne performance — concentre-toi sur les heures de pointe.'),
  (gen_random_uuid(), '2026-03-01', 5, 191.5, 7.7, 359.66, 21, 'Bonne performance — concentre-toi sur les heures de pointe.'),
  (gen_random_uuid(), '2026-03-02', 6, 361.6, 14.5, 668.93, 12, 'Excellente journée — continue sur ta lancée!'),
  (gen_random_uuid(), '2026-03-03', 8, 242.2, 9.7, 459.88, 10, 'Bonne performance — concentre-toi sur les heures de pointe.'),
  (gen_random_uuid(), '2026-03-04', 7, 206, 8.2, 391.86, 14, 'Bonne performance — concentre-toi sur les heures de pointe.'),
  (gen_random_uuid(), '2026-03-05', 4, 27.1, 1.1, 60.72, 24, 'Journée légère — cible les stations de métro et l''aéroport.'),
  (gen_random_uuid(), '2026-03-06', 3, 143.3, 5.7, 266.89, 13, 'Journée légère — cible les stations de métro et l''aéroport.'),
  (gen_random_uuid(), '2026-03-07', 5, 73.2, 2.9, 146.73, 24, 'Journée légère — cible les stations de métro et l''aéroport.'),
  (gen_random_uuid(), '2026-03-08', 6, 246.9, 9.9, 462.46, 25, 'Bonne performance — concentre-toi sur les heures de pointe.'),
  (gen_random_uuid(), '2026-03-09', 9, 253.1, 10.1, 482.57, 20, 'Excellente journée — continue sur ta lancée!'),
  (gen_random_uuid(), '2026-03-10', 6, 222.6, 8.9, 418.65, 24, 'Bonne performance — concentre-toi sur les heures de pointe.'),
  (gen_random_uuid(), '2026-03-11', 4, 158, 6.3, 296.34, 24, 'Bonne performance — concentre-toi sur les heures de pointe.'),
  (gen_random_uuid(), '2026-03-12', 5, 214.7, 8.6, 401.5, 20, 'Bonne performance — concentre-toi sur les heures de pointe.'),
  (gen_random_uuid(), '2026-03-13', 4, 242.4, 9.7, 448.29, 18, 'Bonne performance — concentre-toi sur les heures de pointe.'),
  (gen_random_uuid(), '2026-03-14', 4, 105.2, 4.2, 201.39, 19, 'Journée légère — cible les stations de métro et l''aéroport.'),
  (gen_random_uuid(), '2026-03-15', 2, 76.7, 3.1, 144.1, 14, 'Journée légère — cible les stations de métro et l''aéroport.'),
  (gen_random_uuid(), '2026-03-16', 7, 132.8, 5.3, 260.06, 28, 'Journée légère — cible les stations de métro et l''aéroport.')
ON CONFLICT (report_date) DO UPDATE SET
  total_trips = EXCLUDED.total_trips,
  total_distance_km = EXCLUDED.total_distance_km,
  hours_worked = EXCLUDED.hours_worked,
  total_earnings = EXCLUDED.total_earnings,
  dead_time_pct = EXCLUDED.dead_time_pct,
  ai_recommendation = EXCLUDED.ai_recommendation;

-- ── Sécurité RLS (idempotente — peut être relancée sans erreur) ─
ALTER TABLE cities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones        ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE events       ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read" ON cities;
DROP POLICY IF EXISTS "public read" ON zones;
DROP POLICY IF EXISTS "public read" ON daily_reports;
DROP POLICY IF EXISTS "public read" ON events;

CREATE POLICY "public read" ON cities       FOR SELECT USING (true);
CREATE POLICY "public read" ON zones        FOR SELECT USING (true);
CREATE POLICY "public read" ON daily_reports FOR SELECT USING (true);
CREATE POLICY "public read" ON events       FOR SELECT USING (true);

-- ── Fin de migration ─────────────────────────────────────────

-- ── Événements de démonstration (Mars 2026 — Montréal) ──────
-- Exécuter cette section pour peupler la page Événements.
-- Les UUIDs valides permettent de relancer sans dupliquer.

INSERT INTO public.events (
  id, name, venue, city_id,
  latitude, longitude,
  start_at, end_at,
  capacity, demand_impact, boost_multiplier, boost_radius_km,
  boost_zone_types, category, is_holiday
) VALUES
  ('e0ca0001-cafe-4001-8001-000000000001',
   'Canadiens vs Maple Leafs', 'Centre Bell', 'mtl',
   45.4957, -73.5693,
   '2026-03-18 23:00:00+00', '2026-03-19 02:30:00+00',
   21288, 5, 2.5, 3.0,
   ARRAY['nightlife','commercial'], 'hockey', false),

  ('e0ca0001-cafe-4001-8001-000000000002',
   'Festival MTL en Lumière – Clôture', 'Place des Arts', 'mtl',
   45.5088, -73.5682,
   '2026-03-19 21:00:00+00', '2026-03-20 03:00:00+00',
   8000, 4, 2.0, 2.5,
   ARRAY['nightlife','commercial','tourisme'], 'festival', false),

  ('e0ca0001-cafe-4001-8001-000000000003',
   'Concert OSM — Beethoven', 'Maison Symphonique', 'mtl',
   45.5085, -73.5689,
   '2026-03-20 01:00:00+00', '2026-03-20 03:00:00+00',
   2100, 3, 1.8, 1.5,
   ARRAY['commercial'], 'event', false),

  ('e0ca0001-cafe-4001-8001-000000000004',
   'Match CF Montréal', 'Saputo Stadium', 'mtl',
   45.5635, -73.5525,
   '2026-03-21 19:00:00+00', '2026-03-21 21:30:00+00',
   13034, 4, 2.2, 2.5,
   ARRAY['commercial','transport','événements'], 'event', false),

  ('e0ca0001-cafe-4001-8001-000000000005',
   'Salon de l''Auto de Montréal', 'Palais des Congrès', 'mtl',
   45.5052, -73.5618,
   '2026-03-22 14:00:00+00', '2026-03-23 00:00:00+00',
   12000, 3, 1.6, 1.8,
   ARRAY['commercial','transport'], 'event', false),

  ('e0ca0001-cafe-4001-8001-000000000006',
   'Nuit Blanche Montréal', 'Centre-ville', 'mtl',
   45.5048, -73.5741,
   '2026-03-22 05:00:00+00', '2026-03-22 11:00:00+00',
   40000, 5, 3.0, 5.0,
   ARRAY['nightlife','commercial','tourisme','événements'], 'festival', false),

  ('e0ca0001-cafe-4001-8001-000000000007',
   'Canadiens vs Sénateurs', 'Centre Bell', 'mtl',
   45.4957, -73.5693,
   '2026-03-24 23:00:00+00', '2026-03-25 02:30:00+00',
   21288, 5, 2.5, 3.0,
   ARRAY['nightlife','commercial'], 'hockey', false),

  ('e0ca00bb-cafe-4001-8001-000000000001',
   'Carrefour Laval — Exposition Printemps', 'Carrefour Laval', 'lvl',
   45.5585, -73.7469,
   '2026-03-22 13:00:00+00', '2026-03-22 23:00:00+00',
   5000, 2, 1.4, 1.5,
   ARRAY['commercial'], 'event', false)

ON CONFLICT (id) DO NOTHING;

