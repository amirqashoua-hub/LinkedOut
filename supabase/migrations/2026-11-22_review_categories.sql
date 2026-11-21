-- =========================================================
-- REVIEW CATEGORIES: optional 1-5 sub-ratings on event reviews
-- (Vibes, Drinks, Music, Line wait), like Glassdoor's sub-ratings.
-- Run once in the Supabase SQL Editor. Additive; safe to re-run.
-- Existing reviews keep working (the new columns are just empty).
-- =========================================================

alter table event_reviews
  add column if not exists vibes     int check (vibes     between 1 and 5),
  add column if not exists drinks    int check (drinks    between 1 and 5),
  add column if not exists music     int check (music     between 1 and 5),
  add column if not exists line_wait int check (line_wait between 1 and 5); -- 5 = walked right in

-- Give the reviews that came from seed.sql some sub-ratings, so the averages aren't empty.
-- Only touches reviews whose text is one of the seed's canned lines and that have none yet;
-- reviews people actually wrote are left alone.
update event_reviews
set vibes     = least(5, greatest(1, rating + (abs(hashtext(user_id::text || event_id::text || 'v')) % 3) - 1)),
    drinks    = least(5, greatest(1, rating + (abs(hashtext(user_id::text || event_id::text || 'd')) % 3) - 1)),
    music     = least(5, greatest(1, rating + (abs(hashtext(user_id::text || event_id::text || 'm')) % 3) - 1)),
    line_wait = 1 + abs(hashtext(user_id::text || event_id::text || 'l')) % 5
where vibes is null and drinks is null and music is null and line_wait is null
  and body in (
    'Life-changing. I do not remember most of it, which is how I know it was good.',
    'Great networking. I networked with the floor around 1am.',
    '10/10 would skip a midterm for this again. Already have.',
    'Line was longer than my attention span. Left, came back, regretted both.',
    'Mid. Like my GPA, but louder.',
    'Met my future co-founder in the bathroom line. We are launching nothing together.',
    'Lost my phone, my coat and my sense of self. Would not recommend.',
    'Strong leadership from the DJ. Weak leadership from me.',
    'Fine. My liver filed a formal complaint.',
    'Peak student experience. My parents must never see this review.',
    'Good vibes, bad decisions, solid ROI.',
    'Overpromised, underdelivered. Very on-brand for this school.'
  );

notify pgrst, 'reload schema';
