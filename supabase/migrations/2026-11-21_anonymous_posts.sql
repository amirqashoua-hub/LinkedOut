-- =========================================================
-- ANONYMOUS CONFESSIONS
-- An anonymous post has posts.user_id = NULL, so nobody can see who wrote it,
-- not even through the raw database API. Who wrote it lives in anonymous_posts,
-- which only that author can read (so they can delete their own confession).
-- Posts are created/deleted through two functions, because the normal
-- "own posts" rules need user_id = you.
-- Run once in the Supabase SQL Editor. Additive; safe to re-run.
-- =========================================================

create table if not exists anonymous_posts (
  post_id uuid primary key references posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade
);

alter table anonymous_posts enable row level security;

-- only the author can see their own row; nobody can write directly (functions do it)
drop policy if exists "see own confessions" on anonymous_posts;
create policy "see own confessions" on anonymous_posts
  for select to authenticated using (user_id = auth.uid());

-- anon needs SELECT so the feed view can check "is this mine?" (RLS returns no rows to anon)
grant select on anonymous_posts to anon, authenticated;

-- ---------- create ----------
create or replace function create_anonymous_post(p_raw_text text, p_ai_text text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not logged in';
  end if;
  if char_length(trim(coalesce(p_raw_text, ''))) not between 3 and 280 then
    raise exception 'Confession must be 3 to 280 characters';
  end if;
  if char_length(trim(coalesce(p_ai_text, ''))) not between 3 and 5000 then
    raise exception 'Post text must be 3 to 5000 characters';
  end if;

  insert into posts (user_id, raw_text, ai_text)
  values (null, trim(p_raw_text), trim(p_ai_text))
  returning id into v_id;

  insert into anonymous_posts (post_id, user_id) values (v_id, auth.uid());
  return v_id;
end;
$$;

revoke all on function create_anonymous_post(text, text) from public, anon;
grant execute on function create_anonymous_post(text, text) to authenticated;

-- ---------- delete (only your own confession) ----------
create or replace function delete_anonymous_post(p_post_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from posts p
  using anonymous_posts a
  where p.id = p_post_id and a.post_id = p.id and a.user_id = auth.uid();
  return found;
end;
$$;

revoke all on function delete_anonymous_post(uuid) from public, anon;
grant execute on function delete_anonymous_post(uuid) to authenticated;

-- ---------- feed: keep anonymous posts (LEFT JOIN), add is_anonymous + is_mine at the END ----------
create or replace view feed with (security_invoker = true) as
 SELECT p.id,
    p.raw_text,
    p.ai_text,
    p.created_at,
    pr.id AS author_id,
    pr.full_name,
    pr.handle,
    pr.headline,
    pr.avatar_url,
    COALESCE(( SELECT jsonb_object_agg(x.reaction, x.n) AS jsonb_object_agg
           FROM ( SELECT r.reaction,
                    count(*) AS n
                   FROM post_reactions r
                  WHERE r.post_id = p.id
                  GROUP BY r.reaction) x), '{}'::jsonb) AS reaction_counts,
    ( SELECT r.reaction
           FROM post_reactions r
          WHERE r.post_id = p.id AND r.user_id = auth.uid()) AS my_reaction,
    p.photo_url,
    p.skill_id,
    s.name AS skill_name,
    (p.user_id IS NULL) AS is_anonymous,
    (COALESCE(p.user_id = auth.uid(), false)
      OR EXISTS ( SELECT 1
           FROM anonymous_posts a
          WHERE a.post_id = p.id AND a.user_id = auth.uid())) AS is_mine
   FROM posts p
     LEFT JOIN profiles pr ON pr.id = p.user_id
     LEFT JOIN skills s ON s.id = p.skill_id
  ORDER BY p.created_at DESC;
