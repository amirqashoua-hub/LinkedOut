-- =========================================================
-- PROFILE PHOTO / BANNER UPLOADS: signed-in users may upload into their own
-- folder in the public "avatars" bucket (<user id>/...), used by the camera
-- button and Edit profile. No update/delete rules, so nobody can overwrite or
-- remove existing files (incl. the hand-uploaded photos and logos at the top level).
-- Run once in the Supabase SQL Editor.
-- =========================================================

drop policy if exists "upload own profile images" on storage.objects;
create policy "upload own profile images" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
