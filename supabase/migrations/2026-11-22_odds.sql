-- =========================================================
-- LOCKEDOUT ODDS: over/under lines on your own bad decisions.
-- "Sophie: MATH 240 final grade, O/U 40%" → people vote Over or Under.
-- Run once in the Supabase SQL Editor. Additive: changes no existing table.
-- =========================================================

create table odds_lines (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade, -- who set the line
  subject    text not null check (char_length(subject) between 3 and 80), -- "drinks at BDA tonight"
  line       numeric not null check (line >= 0 and line < 100000),        -- 9
  unit       text check (unit is null or char_length(unit) <= 20),        -- "drinks", "%"
  created_at timestamptz not null default now()
);

create table odds_votes (
  line_id    uuid not null references odds_lines(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  pick       text not null check (pick in ('over', 'under')),
  created_at timestamptz not null default now(),
  primary key (line_id, user_id) -- one vote per person per line
);

alter table odds_lines enable row level security;
alter table odds_votes enable row level security;

-- everyone (including logged-out judges) can read lines and votes
create policy "public read" on odds_lines for select to anon, authenticated using (true);
create policy "public read" on odds_votes for select to anon, authenticated using (true);

-- you can set and delete your own lines
create policy "own lines insert" on odds_lines for insert to authenticated with check (user_id = auth.uid());
create policy "own lines delete" on odds_lines for delete to authenticated using (user_id = auth.uid());

-- you can cast, change and remove your own vote
create policy "own votes insert" on odds_votes for insert to authenticated with check (user_id = auth.uid());
create policy "own votes update" on odds_votes for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own votes delete" on odds_votes for delete to authenticated using (user_id = auth.uid());

-- One row per line with the author, the vote split and the viewer's own pick.
-- security_invoker: runs with the viewer's permissions, so auth.uid() is the viewer.
create or replace view odds_board with (security_invoker = true) as
select
  l.id,
  l.subject,
  l.line,
  l.unit,
  l.created_at,
  l.user_id                                                    as author_id,
  p.full_name,
  p.handle,
  p.avatar_url,
  (count(v.user_id) filter (where v.pick = 'over'))::int       as over_count,
  (count(v.user_id) filter (where v.pick = 'under'))::int      as under_count,
  max(v.pick) filter (where v.user_id = auth.uid())            as my_pick
from odds_lines l
join profiles p on p.id = l.user_id
left join odds_votes v on v.line_id = l.id
group by l.id, p.full_name, p.handle, p.avatar_url;

grant select on odds_board to anon, authenticated;

-- ---------------------------------------------------------
-- Starter lines for the demo (seed people). Also copy this block into
-- seed.sql: the reset truncates profiles, which cascades to these tables.
-- ---------------------------------------------------------
with new_lines as (
  insert into odds_lines (user_id, subject, line, unit) values
    ('acb41395-a491-4c0e-bcfa-0700bc8c0224', 'MATH 240 final grade',  40, '%'),
    ('00000000-0000-0000-0000-000000000003', 'drinks at BDA tonight',  9, 'drinks'),
    ('00000000-0000-0000-0000-000000000001', 'lectures attended this week', 1.5, 'lectures'),
    ('00000000-0000-0000-0000-000000000004', 'hours of sleep before the midterm', 3.5, 'hours')
  returning id, subject
)
insert into odds_votes (line_id, user_id, pick)
select nl.id, v.user_id::uuid, v.pick
from new_lines nl
join (values
  ('MATH 240 final grade',              '00000000-0000-0000-0000-000000000001', 'under'),
  ('MATH 240 final grade',              '00000000-0000-0000-0000-000000000003', 'under'),
  ('MATH 240 final grade',              '00000000-0000-0000-0000-000000000004', 'under'),
  ('MATH 240 final grade',              '00000000-0000-0000-0000-000000000005', 'over'),
  ('drinks at BDA tonight',             '00000000-0000-0000-0000-000000000001', 'over'),
  ('drinks at BDA tonight',             '00000000-0000-0000-0000-000000000004', 'over'),
  ('drinks at BDA tonight',             '00000000-0000-0000-0000-000000000006', 'over'),
  ('drinks at BDA tonight',             'acb41395-a491-4c0e-bcfa-0700bc8c0224', 'over'),
  ('drinks at BDA tonight',             '00000000-0000-0000-0000-000000000008', 'under'),
  ('lectures attended this week',       '00000000-0000-0000-0000-000000000003', 'under'),
  ('lectures attended this week',       '00000000-0000-0000-0000-000000000005', 'under'),
  ('hours of sleep before the midterm', '00000000-0000-0000-0000-000000000003', 'under'),
  ('hours of sleep before the midterm', '00000000-0000-0000-0000-000000000006', 'over')
) as v(subject, user_id, pick) on v.subject = nl.subject;
