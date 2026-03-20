-- Migration: push_subscriptions — HustleGo
-- Stocke les souscriptions Web Push (VAPID) par appareil/chauffeur.
-- Une souscription = un endpoint unique (navigateur + device).

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id   TEXT,                              -- optionnel — peut être null si anonyme
  endpoint    TEXT        NOT NULL UNIQUE,        -- URL d'endpoint push (navigateur-fournie)
  p256dh      TEXT        NOT NULL,               -- clé publique ECDH (base64url)
  auth        TEXT        NOT NULL,               -- secret d'auth HMAC (base64url)
  user_agent  TEXT,                              -- info navigateur pour debug
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour retrouver rapidement toutes les souscriptions d'un chauffeur
CREATE INDEX IF NOT EXISTS push_subscriptions_driver_idx
  ON push_subscriptions (driver_id)
  WHERE driver_id IS NOT NULL;

-- Trigger de mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER trg_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- RLS : chaque ligne lisible uniquement via service role (EF) ou par le driver lui-même
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Service role bypass RLS automatiquement → pas de policy nécessaire pour EF
-- Policy pour accès anonyme : INSERT only (souscription initiale)
CREATE POLICY "allow_insert_own_subscription"
  ON push_subscriptions FOR INSERT
  WITH CHECK (true);

-- Policy lecture : uniquement le driver lui-même (si driver_id = auth.uid())
CREATE POLICY "allow_read_own_subscription"
  ON push_subscriptions FOR SELECT
  USING (driver_id IS NULL OR driver_id = auth.uid()::text);

-- Policy suppression : driver peut désabonner son endpoint
CREATE POLICY "allow_delete_own_subscription"
  ON push_subscriptions FOR DELETE
  USING (driver_id IS NULL OR driver_id = auth.uid()::text);
