-- ============================================================
-- Migration: fix_events_external_id_upsert
-- Delivroom (hibzhsjgipybfihhzpxr)
--
-- 20260905131542_events_external_id_and_sync_cron.sql created
-- events_external_id_idx as a PARTIAL unique index
-- (`WHERE external_id IS NOT NULL`). Postgres can only use an index to
-- satisfy `ON CONFLICT (external_id)` when the index's predicate (if any)
-- exactly matches the conflict target in the query — a plain
-- `.upsert(rows, { onConflict: 'external_id' })` from supabase-js never
-- includes a WHERE clause, so it could never resolve to this index.
-- Every upsert from event-sync (and the new gtfs-alerts-sync) has been
-- failing with "there is no unique or exclusion constraint matching the
-- ON CONFLICT specification" since that migration — caught while manually
-- invoking gtfs-alerts-sync for the first time.
--
-- Fix: drop the partial predicate. Postgres unique indexes already treat
-- every NULL as distinct from every other NULL, so a full (non-partial)
-- unique index on external_id still lets an unlimited number of
-- hand-seeded events (external_id IS NULL, e.g. 20260319000001_events_2026)
-- coexist — the original comment's intent — while making plain
-- ON CONFLICT (external_id) resolvable for the sync jobs.
--
-- Verified before writing this: no existing non-null external_id is
-- currently duplicated, so this alteration is safe to apply immediately.
-- ============================================================

DROP INDEX IF EXISTS public.events_external_id_idx;

CREATE UNIQUE INDEX IF NOT EXISTS events_external_id_idx
  ON public.events (external_id);
