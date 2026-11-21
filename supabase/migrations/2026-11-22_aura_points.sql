-- =========================================================
-- AURA POINTS: settle odds lines and score the bettors.
-- Run once in the Supabase SQL Editor, AFTER 2026-11-22_odds.sql.
--
-- Rules
--   * Only the person who set a line can end the betting (settle_odds_line).
--   * They enter the actual result: above the line → "over" wins, below → "under",
--     exactly on the line → "push" (nobody gains or loses).
--   * Winners gain AP from the odds at settle time: 100 × (other side ÷ your side),
--     clamped to 10–500 (backing the long shot pays more). Losers lose 50 AP.
--   * You can't bet on your own line, and votes lock once a line is settled.
--   * Everyone starts at 0 AP.
-- =========================================================

alter table odds_lines
  add column if not exists result       numeric check (result is null or result >= 0),
  add column if not exists outcome      text check (outcome is null or outcome in ('over', 'under', 'push')),
  add column if not exists over_payout  int,
  add column if not exists under_payout int,
  add column if not exists settled_at   timestamptz;

-- Votes: only on open lines, and never on your own line
drop policy if exists "own votes insert" on odds_votes;
drop policy if exists "own votes update" on odds_votes;
drop policy if exists "own votes delete" on odds_votes;

create policy "own votes insert" on odds_votes for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from odds_lines l
                where l.id = odds_votes.line_id and l.settled_at is null and l.user_id <> auth.uid())
  );
create policy "own votes update" on odds_votes for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from odds_lines l
                where l.id = odds_votes.line_id and l.settled_at is null and l.user_id <> auth.uid())
  );
create policy "own votes delete" on odds_votes for delete to authenticated
  using (
    user_id = auth.uid()
    and exists (select 1 from odds_lines l where l.id = odds_votes.line_id and l.settled_at is null)
  );

-- End the betting. Runs with elevated rights but checks the caller is the line's setter,
-- and computes the payouts itself so nobody can fake them from the browser.
create or replace function settle_odds_line(p_line_id uuid, p_result numeric)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  l odds_lines;
  n_over int;
  n_under int;
  v_outcome text;
  v_over_payout int;
  v_under_payout int;
begin
  select * into l from odds_lines where id = p_line_id for update;
  if not found then raise exception 'Line not found'; end if;
  if l.user_id is distinct from auth.uid() then
    raise exception 'Only the person who set the line can end the betting';
  end if;
  if l.settled_at is not null then raise exception 'This line is already settled'; end if;
  if p_result is null or p_result < 0 then raise exception 'Enter what actually happened (0 or more)'; end if;

  select count(*) filter (where pick = 'over'), count(*) filter (where pick = 'under')
    into n_over, n_under
  from odds_votes where line_id = p_line_id;

  v_outcome := case when p_result > l.line then 'over'
                    when p_result < l.line then 'under'
                    else 'push' end;

  -- 100 × (other side ÷ your side), clamped 10–500; 0 if nobody bet that side
  v_over_payout  := case when n_over  = 0 then 0
                         else least(500, greatest(10, round(100.0 * n_under / n_over)))::int end;
  v_under_payout := case when n_under = 0 then 0
                         else least(500, greatest(10, round(100.0 * n_over / n_under)))::int end;

  update odds_lines
     set result = p_result, outcome = v_outcome,
         over_payout = v_over_payout, under_payout = v_under_payout,
         settled_at = now()
   where id = p_line_id;

  return json_build_object(
    'outcome', v_outcome,
    'over_payout', v_over_payout,
    'under_payout', v_under_payout,
    'bettors', n_over + n_under
  );
end;
$$;

revoke all on function settle_odds_line(uuid, numeric) from public;
grant execute on function settle_odds_line(uuid, numeric) to authenticated;

-- Each person's Aura Points: winnings minus 50 per lost bet, over all settled lines
create or replace view aura_points with (security_invoker = true) as
select
  v.user_id,
  sum(case
        when l.outcome = 'push' then 0
        when v.pick = l.outcome then case when v.pick = 'over' then l.over_payout else l.under_payout end
        else -50
      end)::int as aura
from odds_votes v
join odds_lines l on l.id = v.line_id
where l.settled_at is not null
group by v.user_id;

grant select on aura_points to anon, authenticated;

-- The board view gains the settle columns (appended at the end, as Postgres requires)
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
  max(v.pick) filter (where v.user_id = auth.uid())            as my_pick,
  l.result,
  l.outcome,
  l.over_payout,
  l.under_payout,
  l.settled_at
from odds_lines l
join profiles p on p.id = l.user_id
left join odds_votes v on v.line_id = l.id
group by l.id, p.full_name, p.handle, p.avatar_url;

grant select on odds_board to anon, authenticated;

notify pgrst, 'reload schema';
