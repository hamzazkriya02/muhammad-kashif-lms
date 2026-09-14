-- Run once on the existing PostgreSQL database before deploying the updated code.
-- Safe to re-run. Existing lessons get an empty list; no records are deleted.
ALTER TABLE "lessons"
  ADD COLUMN IF NOT EXISTS "resources" JSONB NOT NULL DEFAULT '[]'::jsonb;
