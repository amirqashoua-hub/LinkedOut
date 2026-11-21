-- =========================================================
-- Settled odds lines can't be deleted (it would wipe everyone's Aura Points from it).
-- Run once in the Supabase SQL Editor, AFTER 2026-11-22_aura_points.sql.
-- Setters can still delete their own lines while betting is open.
-- =========================================================

drop policy if exists "own lines delete" on odds_lines;

create policy "own lines delete" on odds_lines for delete to authenticated
  using (user_id = auth.uid() and settled_at is null);
