-- =========================================================
-- DEMO RESET: rewinds only what the demo path uses up.
-- Run before each rehearsal and before the real demo (Supabase SQL Editor).
--
-- KEEPS: all posts (incl. yours), reactions, skills, other people's
--        endorsements, worst classes, confessions, odds lines and votes,
--        everyone else's RSVPs/reviews, photos, banners.
-- RESETS (demo user, Sophie, only):
--   * Experience counts      -> BDA 14 (one +1 = Senior Associate 🎉), Blues 16, ...
--   * "Did you attend?"      -> back for Blues: Last Call + SUS Holiday Social
--   * Events RSVPs           -> the seed's 5 (Easy Apply works again)
--   * Enablers               -> Ella/Amir/Mazen/both Brooklyns accepted,
--                               Anya's request pending, Evan + Spencer/Ishita/Sofia not connected
--   * Endorsements           -> none from demo on Ella's skills; none between demo and Evan
--   * Event reviews by demo  -> removed (review live again)
--   * Odds lines set by demo -> un-settled (End betting works again)
--
-- Safe to run any number of times. Everything is in one transaction:
-- if any step fails, nothing changes.
-- Full wipe-and-rebuild is still supabase/seed.sql (emergency only).
-- =========================================================

begin;

-- ---------- Experience (visit counts) ----------
-- places created by "Did you attend?" for events that had no place (SUS Holiday Social, Grad Ball)
update events set place_id = null
where id in ('30000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000008');

delete from places
where name in (select title from events
               where id in ('30000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000008'))
  and id::text not like '10000000-0000-0000-0000-%';

-- demo's counts back to the seed (keeps any +1 photos)
insert into visits (user_id, place_id, count, first_visit, last_visit) values
('acb41395-a491-4c0e-bcfa-0700bc8c0224','10000000-0000-0000-0000-000000000001',52,'2024-09-03','2026-11-19'), -- Gerts: Founder
('acb41395-a491-4c0e-bcfa-0700bc8c0224','10000000-0000-0000-0000-000000000007',31,'2024-10-11','2026-11-15'), -- Cafe Campus: Partner
('acb41395-a491-4c0e-bcfa-0700bc8c0224','10000000-0000-0000-0000-000000000008',16,'2024-11-08','2026-10-24'), -- Blues: Senior Associate
('acb41395-a491-4c0e-bcfa-0700bc8c0224','10000000-0000-0000-0000-000000000002',14,'2025-01-17','2026-11-13'), -- BDA: one +1 -> Senior Associate
('acb41395-a491-4c0e-bcfa-0700bc8c0224','10000000-0000-0000-0000-000000000004',6,'2025-02-02','2026-02-06'),   -- E-Week: Associate
('acb41395-a491-4c0e-bcfa-0700bc8c0224','10000000-0000-0000-0000-000000000003',3,'2025-02-06','2026-02-13'),   -- Carni: Intern
('acb41395-a491-4c0e-bcfa-0700bc8c0224','10000000-0000-0000-0000-000000000005',2,'2025-01-25','2026-01-24')    -- Science Games: Intern
on conflict (user_id, place_id) do update
  set count = excluded.count, first_visit = excluded.first_visit, last_visit = excluded.last_visit;

-- any other place demo +1'd during a rehearsal (e.g. The Lab)
delete from visits
where user_id = 'acb41395-a491-4c0e-bcfa-0700bc8c0224'
  and place_id not in ('10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000007',
                       '10000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000002',
                       '10000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000003',
                       '10000000-0000-0000-0000-000000000005');

-- ---------- Events RSVPs (incl. the two "Did you attend?" prompts) ----------
delete from rsvps
where user_id = 'acb41395-a491-4c0e-bcfa-0700bc8c0224'
  and event_id not in ('30000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000005',
                       '30000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000001',
                       '30000000-0000-0000-0000-000000000002');

insert into rsvps (user_id, event_id, attended) values
('acb41395-a491-4c0e-bcfa-0700bc8c0224','30000000-0000-0000-0000-000000000003',null), -- Blues: Last Call (past, prompt)
('acb41395-a491-4c0e-bcfa-0700bc8c0224','30000000-0000-0000-0000-000000000005',null), -- SUS Holiday Social (past, prompt)
('acb41395-a491-4c0e-bcfa-0700bc8c0224','30000000-0000-0000-0000-000000000007',true), -- Carni (attended)
('acb41395-a491-4c0e-bcfa-0700bc8c0224','30000000-0000-0000-0000-000000000001',null), -- Science Games (upcoming)
('acb41395-a491-4c0e-bcfa-0700bc8c0224','30000000-0000-0000-0000-000000000002',null)  -- Gerts Trivia (upcoming)
on conflict (user_id, event_id) do update set attended = excluded.attended;

-- ---------- Event reviews by demo ----------
delete from event_reviews where user_id = 'acb41395-a491-4c0e-bcfa-0700bc8c0224';

-- ---------- Enablers (connections) ----------
delete from connections
where 'acb41395-a491-4c0e-bcfa-0700bc8c0224' in (user_a, user_b);

insert into connections (user_a, user_b, status) values
('00000000-0000-0000-0000-000000000001','acb41395-a491-4c0e-bcfa-0700bc8c0224','accepted'), -- Ella
('00000000-0000-0000-0000-000000000002','acb41395-a491-4c0e-bcfa-0700bc8c0224','accepted'), -- Amir
('00000000-0000-0000-0000-000000000003','acb41395-a491-4c0e-bcfa-0700bc8c0224','accepted'), -- Mazen
('00000000-0000-0000-0000-000000000005','acb41395-a491-4c0e-bcfa-0700bc8c0224','accepted'), -- Brooklyn B.
('00000000-0000-0000-0000-000000000006','acb41395-a491-4c0e-bcfa-0700bc8c0224','accepted'), -- Brooklyn W.
('00000000-0000-0000-0000-000000000010','acb41395-a491-4c0e-bcfa-0700bc8c0224','pending');  -- Anya: "Accept" demo

-- ---------- Endorsements ----------
-- demo -> Ella's skills: none, so every Endorse button works on stage
delete from endorsements e using skills s
where e.skill_id = s.id
  and e.endorser_id = 'acb41395-a491-4c0e-bcfa-0700bc8c0224'
  and s.user_id = '00000000-0000-0000-0000-000000000001';

-- nothing between demo and people who aren't demo's enablers (Evan, Spencer, Ishita, Sofia, Anya)
delete from endorsements e using skills s
where e.skill_id = s.id
  and ((s.user_id = 'acb41395-a491-4c0e-bcfa-0700bc8c0224'
        and e.endorser_id in ('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000007',
                              '00000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000009',
                              '00000000-0000-0000-0000-000000000010'))
    or (e.endorser_id = 'acb41395-a491-4c0e-bcfa-0700bc8c0224'
        and s.user_id in ('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000007',
                          '00000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000009',
                          '00000000-0000-0000-0000-000000000010')));

-- ---------- Odds: lines demo set are open again ----------
update odds_lines
set result = null, outcome = null, over_payout = null, under_payout = null, settled_at = null
where user_id = 'acb41395-a491-4c0e-bcfa-0700bc8c0224';

commit;
