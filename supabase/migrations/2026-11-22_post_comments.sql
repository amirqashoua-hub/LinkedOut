-- =========================================================
-- POST COMMENTS: comment on anyone's post (max 500 characters).
-- Run once in the Supabase SQL Editor. Additive: one new table.
-- =========================================================

create table post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts(id) on delete cascade,     -- deleting a post removes its comments
  user_id    uuid not null references profiles(id) on delete cascade,
  body       text not null check (char_length(btrim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index post_comments_post_id_idx on post_comments (post_id, created_at);

alter table post_comments enable row level security;

-- everyone (including logged-out judges) can read comments
create policy "public read" on post_comments for select to anon, authenticated using (true);

-- signed-in users write and delete their own comments
create policy "own comments insert" on post_comments for insert to authenticated with check (user_id = auth.uid());
create policy "own comments delete" on post_comments for delete to authenticated using (user_id = auth.uid());

notify pgrst, 'reload schema';
