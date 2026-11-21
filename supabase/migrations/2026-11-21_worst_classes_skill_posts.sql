-- =========================================================
-- 1) WORST CLASSES: any number of (course, grade) per person.
-- 2) SKILL POSTS: posts.skill_id links a "new skill" post to its skill;
--    deleting the skill deletes the post. feed exposes skill_id + skill_name.
-- Run once in the Supabase SQL Editor. Additive; safe to re-run.
-- =========================================================

-- ---------- 1) worst_classes ----------
create table if not exists worst_classes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  course     text not null check (char_length(trim(course)) between 2 and 80),
  grade      text check (grade is null or char_length(grade) <= 30),
  created_at timestamptz not null default now()
);

alter table worst_classes enable row level security;

drop policy if exists "public read" on worst_classes;
create policy "public read" on worst_classes
  for select to anon, authenticated using (true);

drop policy if exists "own worst classes" on worst_classes;
create policy "own worst classes" on worst_classes
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select on worst_classes to anon, authenticated;
grant insert, update, delete on worst_classes to authenticated;

-- bring over everyone's current worst class (only if the table is still empty)
insert into worst_classes (user_id, course, grade)
select id, worst_class, worst_grade from profiles
where worst_class is not null and char_length(trim(worst_class)) >= 2
  and not exists (select 1 from worst_classes);

-- ---------- 2) skill posts ----------
alter table posts add column if not exists skill_id uuid references skills(id) on delete cascade;

-- Same feed as before (incl. photo_url), plus skill_id and skill_name at the END
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
    s.name AS skill_name
   FROM posts p
     JOIN profiles pr ON pr.id = p.user_id
     LEFT JOIN skills s ON s.id = p.skill_id
  ORDER BY p.created_at DESC;
