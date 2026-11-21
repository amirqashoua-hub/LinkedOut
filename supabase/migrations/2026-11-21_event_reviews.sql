-- =========================================================
-- EVENT REVIEWS: 1-5 stars + optional comment, one per person per event.
-- Only people who confirmed they attended (rsvps.attended = true) can review.
-- Run once in the Supabase SQL Editor. Additive: changes no existing table.
-- =========================================================

create table event_reviews (
  event_id   uuid not null references events(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  rating     int  not null check (rating between 1 and 5),
  body       text check (body is null or char_length(body) <= 500),
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

alter table event_reviews enable row level security;

-- everyone (including logged-out judges) can read reviews
create policy "public read" on event_reviews
  for select to anon, authenticated using (true);

-- you can write your own review, only for events you attended
create policy "attendees review" on event_reviews
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from rsvps r
                where r.event_id = event_reviews.event_id
                  and r.user_id = auth.uid()
                  and r.attended)
  );

create policy "edit own review" on event_reviews
  for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from rsvps r
                where r.event_id = event_reviews.event_id
                  and r.user_id = auth.uid()
                  and r.attended)
  );

create policy "delete own review" on event_reviews
  for delete to authenticated using (user_id = auth.uid());

grant select on event_reviews to anon, authenticated;
grant insert, update, delete on event_reviews to authenticated;
