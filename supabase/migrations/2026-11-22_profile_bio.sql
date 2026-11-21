-- =========================================================
-- PROFILE BIO: a short "About" text, max 200 characters.
-- Run once in the Supabase SQL Editor. Additive: one new nullable column.
-- Editing it uses the existing "users can update their own profile" rule.
-- =========================================================

alter table profiles
  add column if not exists bio text check (bio is null or char_length(bio) <= 200);

notify pgrst, 'reload schema';
