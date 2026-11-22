-- =========================================================
-- AD EVENTS: the three "Promoted" bar posters as real events, so their
-- "I'm going" button is a real RSVP and they link to /events/<id>.
-- Posters are served by the site itself (public/ads/). Fixed ids, referenced
-- in lib/ads.ts. Run once in the Supabase SQL Editor; safe to re-run.
-- =========================================================

insert into events (id, title, org, starts_at, location, description, place_id, source, image_url) values
('30000000-0000-0000-0000-000000000011', 'BDBAND', 'Bar des Arts × Jam for Justice',
 '2026-11-26 20:00-05', 'Bar des Arts',
 'Blufin, Bebe and Oona, Resonance. In support of Motionball and Special Olympics Canada.',
 '10000000-0000-0000-0000-000000000002', 'manual', '/ads/bdband.webp'),
('30000000-0000-0000-0000-000000000012', 'MEUS Blues Choice Awards 2026', 'MEUS',
 '2026-11-27 16:00-05', 'EUS Common Room',
 'Get slimed. Get nominated. Get recognized for your contributions to nothing.',
 null, 'manual', '/ads/blues-choice-awards.webp'),
('30000000-0000-0000-0000-000000000013', 'LABBA', 'The Lab',
 '2026-12-03 21:00-05', 'The Lab',
 'Mamma mia, here we go again. Dancing queen experience required.',
 '10000000-0000-0000-0000-000000000009', 'manual', '/ads/labba.webp')
on conflict (id) do nothing;
