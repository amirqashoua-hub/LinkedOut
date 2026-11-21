-- =========================================================
-- LINKEDOUT SEED DATA
-- Safe to re-run: wipes all app data first, then reseeds.
-- Demo user: acb41395-a491-4c0e-bcfa-0700bc8c0224
-- =========================================================

truncate profiles, places, events cascade;

-- ---------- PROFILES ----------
insert into profiles (id, handle, full_name, headline, school, program, year, worst_grade, worst_class, hide_grade) values
('acb41395-a491-4c0e-bcfa-0700bc8c0224','sophie-mcbroom','Sophie McB','VP of Skipping 8:30s | 3x Add/Drop Survivor | #OpenToNothing','McGill University','B.Sc. Computer Science','U3','C- (curved up from D+)','COMP 251: attended 3 lectures, learned 0 things',false),
('00000000-0000-0000-0000-000000000001','ella-rikley','Ella Rikley','Professional Lecture Skipper | Gerts Loyalty Program Platinum','McGill University','B.A. Economics','U2','D','ECON 208: thought it was reading week',false),
('00000000-0000-0000-0000-000000000002','amir-qashoua','Amir Qashoua','Chief Procrastination Officer | Ex-Attendee of Office Hours','McGill University','B.Sc. Biology','U3','F (withdrew in spirit)','CHEM 212: the lab coat is still in the fume hood',false),
('00000000-0000-0000-0000-000000000003','mazen-asali','MazenAsali','E-Week Veteran | Opened a Beer With a Lighter (Verified)','McGill University','B.Eng. Mechanical Engineering','U4','D-','MATH 263: the integral won',false),
('00000000-0000-0000-0000-000000000004','evan-deng','Evan Deng','Founder @ Napping in McLennan | Ex-Science Games MVP','McGill University','B.Sc. Psychology','U2','C-','BIOL 112: memorized the wrong chapter',false),
('00000000-0000-0000-0000-000000000005','brooklyn-barootes','Brooklyn Barootes','Thought Leader in Late Submissions | #OpenToNapping','McGill University','B.Com. Management','U3','D+','MGCR 211: still unsure what a debit is',false),
('00000000-0000-0000-0000-000000000006','brooklyn-waddell','Brooklyn Waddell','Partner @ Cafe Campus | Recovering Overcommitter','McGill University','B.A. Political Science','U1','C','POLI 212: read the syllabus in week 11',false),
('00000000-0000-0000-0000-000000000007','spencer-jantzen','Spencer Jantzen','Full-Stack Procrastinator | COMP 202 Survivor','McGill University','B.Sc. Computer Science','U2','F','COMP 202: infinite loop, infinite regret',false),
('00000000-0000-0000-0000-000000000008','ishita-kumar','Ishita Kumar','Aspiring Nap Specialist | Blues Regular','McGill University','B.A. History','U3','D','HIST 214: confused two wars',false),
('00000000-0000-0000-0000-000000000009','sofia-filippov','Sofia Filippov','Head of Missing the Add/Drop Deadline | Frosh Leader (Retired)','McGill University','B.Sc. Physics','U4','C-','PHYS 230: the physics did not phys',false),
('00000000-0000-0000-0000-000000000010','anya-kasuri','Anya Kasuri','VP of Showing Up Only to Midterms | Gym Membership Holder (Unused)','McGill University','B.Eng. Software Engineering','U2','D+','ECSE 222: the circuit was never complete',true);

update profiles set avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/ishita.png' where handle = 'ishita-kumar';
update profiles set avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/brooklyn.png' where handle = 'brooklyn-waddell';
update profiles set avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/anya.png' where handle = 'anya-kasuri';
update profiles set avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/sophie.jpeg' where handle = 'sophie-mcb';
update profiles set avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/ella.jpeg' where handle = 'ella-rikley';
update profiles set avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/amir.jpeg' where handle = 'amir-qashoua';
update profiles set avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/mazen.jpeg' where handle = 'mazen-asali';
update profiles set avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/spencer.png' where handle = 'spencer-jantzen';
update profiles set avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/evan.jpeg' where handle = 'evan-deng';
update profiles set avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/sofia.jpeg' where handle = 'sofia-filippov';
update profiles set avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/brook.png' where handle = 'brooklyn-barootes';

-- ---------- PLACES ----------
insert into places (id, name, type) values
('10000000-0000-0000-0000-000000000001','Gerts','bar'),
('10000000-0000-0000-0000-000000000002','BDA','bar'),
('10000000-0000-0000-0000-000000000003','Carni','drinking_week'),
('10000000-0000-0000-0000-000000000004','E-Week','drinking_week'),
('10000000-0000-0000-0000-000000000005','Science Games','drinking_week'),
('10000000-0000-0000-0000-000000000007','Cafe Campus','club'),
('10000000-0000-0000-0000-000000000008','Blues','bar'),
('10000000-0000-0000-0000-000000000009','The Lab','bar'),
('10000000-0000-0000-0000-000000000006','OAP','drinking_week');

-- ---------- VISITS (demo user: one of every title) ----------
insert into visits (user_id, place_id, count, first_visit, last_visit) values
('acb41395-a491-4c0e-bcfa-0700bc8c0224','10000000-0000-0000-0000-000000000001',52,'2024-09-03','2026-11-19'), -- Gerts: Founder
('acb41395-a491-4c0e-bcfa-0700bc8c0224','10000000-0000-0000-0000-000000000007',31,'2024-10-11','2026-11-15'), -- Cafe Campus: Partner
('acb41395-a491-4c0e-bcfa-0700bc8c0224','10000000-0000-0000-0000-000000000008',16,'2024-11-08','2026-10-24'), -- Blues: Senior Associate
('acb41395-a491-4c0e-bcfa-0700bc8c0224','10000000-0000-0000-0000-000000000002',14,'2025-01-17','2026-11-13'),  -- BDA: Associate, one +1 on stage -> Senior Associate 🎉
('acb41395-a491-4c0e-bcfa-0700bc8c0224','10000000-0000-0000-0000-000000000004',6,'2025-02-02','2026-02-06'),   -- E-Week: Associate
('acb41395-a491-4c0e-bcfa-0700bc8c0224','10000000-0000-0000-0000-000000000003',3,'2025-02-06','2026-02-13'),   -- Carni: Intern
('acb41395-a491-4c0e-bcfa-0700bc8c0224','10000000-0000-0000-0000-000000000006',9,'2024-09-12','2026-09-18'),   -- OAP: Associate
('acb41395-a491-4c0e-bcfa-0700bc8c0224','10000000-0000-0000-0000-000000000005',2,'2025-01-25','2026-01-24');   -- Science Games: Intern

-- everyone else: deterministic pseudo-random tallies
insert into visits (user_id, place_id, count, first_visit, last_visit)
select p.id, pl.id,
       (abs(hashtext(p.handle || pl.name)) % 35) + 1,
       now() - interval '400 days' + (abs(hashtext(pl.name || p.handle)) % 200) * interval '1 day',
       now() - (abs(hashtext(p.handle)) % 20) * interval '1 day'
from profiles p cross join places pl
where p.id <> 'acb41395-a491-4c0e-bcfa-0700bc8c0224'
  and abs(hashtext(p.handle || 'x' || pl.name)) % 3 <> 0;

-- ---------- SKILLS ----------
insert into skills (user_id, name) values
('acb41395-a491-4c0e-bcfa-0700bc8c0224','Procrastination'),
('acb41395-a491-4c0e-bcfa-0700bc8c0224','Opening a Beer With a Lighter'),
('acb41395-a491-4c0e-bcfa-0700bc8c0224','Writing a 10-Page Essay at 4am'),
('acb41395-a491-4c0e-bcfa-0700bc8c0224','Leaving the Function Without Telling Anyone'),
('acb41395-a491-4c0e-bcfa-0700bc8c0224','Doing the Readings on the Bus'),
('acb41395-a491-4c0e-bcfa-0700bc8c0224','Microwaving Instant Ramen');

insert into skills (user_id, name)
select p.id, s.name
from profiles p cross join (values
  ('Procrastination'),('Napping in McLennan'),('Skipping 8:30s'),('Beer Pong'),
  ('Doing the Readings on the Bus'),('Leaving the Function Without Telling Anyone'),
  ('Surviving on Tim Hortons'),('Pulling All-Nighters'),('Ignoring Emails'),('Showing Up Only to Midterms')
) s(name)
where p.id <> 'acb41395-a491-4c0e-bcfa-0700bc8c0224'
  and abs(hashtext(p.handle || s.name)) % 2 = 0;

-- ---------- CONNECTIONS ----------
-- demo is connected to everyone; profile 10's (Anya) request is pending (so you can demo "Accept")
-- match by id, not handle: handles get renamed
insert into connections (user_a, user_b, status)
select p.id, 'acb41395-a491-4c0e-bcfa-0700bc8c0224',
       case when p.id = '00000000-0000-0000-0000-000000000010' then 'pending' else 'accepted' end
from profiles p
where p.id <> 'acb41395-a491-4c0e-bcfa-0700bc8c0224';

insert into connections (user_a, user_b, status)
select a.id, b.id, 'accepted'
from profiles a join profiles b on a.handle < b.handle
where a.id <> 'acb41395-a491-4c0e-bcfa-0700bc8c0224'
  and b.id <> 'acb41395-a491-4c0e-bcfa-0700bc8c0224'
  and abs(hashtext(a.handle || b.handle)) % 3 = 0;

-- ---------- ENDORSEMENTS (only from accepted connections) ----------
insert into endorsements (skill_id, endorser_id, created_at)
select s.id, c.other, now() - (abs(hashtext(s.name || c.other::text)) % 30) * interval '1 day'
from skills s
join (
  select user_a as me, user_b as other from connections where status = 'accepted'
  union all
  select user_b, user_a from connections where status = 'accepted'
) c on c.me = s.user_id
where abs(hashtext(s.name || c.other::text)) % 3 <> 0;

-- ---------- POSTS ----------
insert into posts (id, user_id, raw_text, ai_text, created_at) values
('20000000-0000-0000-0000-000000000001','acb41395-a491-4c0e-bcfa-0700bc8c0224',
 'Slept through my COMP 251 midterm',
 'I''m humbled to share that this morning I made the strategic decision to prioritize rest over assessment. 😴

Here are 3 takeaways:
1. Sleep is a deliverable.
2. Alarms are a suggestion, not a contract.
3. The curve is a community.

Grateful to my mattress for its unwavering support. #Growth #Resilience #OpenToNothing',
 now() - interval '2 hours'),

('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001',
 'Went to Gerts for one drink, left at close',
 'Excited to announce I recently completed an extended stakeholder engagement session at Gerts. 🍻 What began as a 1-drink scope expanded into a 6-hour cross-functional alignment.

Key learning: scope creep is a mindset. Huge thanks to the bartender for mentoring me. #Leadership #Networking #Agile',
 now() - interval '5 hours'),

('20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000002',
 'Forgot my lab coat in the fume hood for 3 weeks',
 'Thrilled to share that my lab coat has completed a 3-week immersive residency in the CHEM 212 fume hood. 🥼

Sometimes the best way to lead is to let your assets operate independently. Takeaway: delegation > attendance. #Science #Ownership #Humbled',
 now() - interval '9 hours'),

('20000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000003',
 'Opened a beer with a lighter at E-Week and chipped my tooth',
 'After years of practice, I achieved a hands-on breakthrough in beverage access engineering at E-Week. 🔥🍺 The tooth was a sunk cost.

Three lessons:
1. Fail fast.
2. Fail loud.
3. Smile anyway.

#Engineering #Innovation #Grit',
 now() - interval '1 day'),

('20000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000004',
 'Fell asleep in McLennan and security woke me up at closing',
 'Honoured to have been personally escorted out of McLennan by building security at closing time. 📚 When you commit to deep work, the building commits to you.

Takeaway: there is no such thing as overtime, only overtime-adjacent naps. #DeepWork #Hustle #Rest',
 now() - interval '1 day 4 hours'),

('20000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000005',
 'Submitted my assignment 4 minutes late and lost 10%',
 'Proud to announce I delivered my MGCR 211 assignment at 11:63 PM, a bold reinterpretation of the deadline. ⏰ The 10% penalty was an investment in my personal brand.

Remember: done is better than on time. #TimeManagement #Disruption #Growth',
 now() - interval '1 day 9 hours'),

('20000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000007',
 'My COMP 202 assignment had an infinite loop and the autograder gave me 0',
 'I''m excited to share that my latest COMP 202 submission achieved infinite scalability. ♾️ The autograder was not ready for that level of commitment.

Lesson learned: some systems just can''t handle your potential. #SoftwareEngineering #Scale #OpenToWork',
 now() - interval '2 days'),

('20000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000009',
 'Missed the add/drop deadline by 1 hour',
 'After careful reflection, I''ve decided to remain in PHYS 230, a decision made for me by Minerva at 12:01 AM. ⌛

Sometimes the universe chooses your path. Grateful for the opportunity to learn physics against my will. #Resilience #Commitment #Growth',
 now() - interval '2 days 6 hours'),

('20000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000008',
 'Went to Blues the night before my final',
 'This week I stress-tested my academic resilience by attending Blues 9 hours before my HIST 214 final. 🎶 Results: inconclusive.

Key takeaway: preparation is a state of mind, and my mind was on the dance floor. #WorkLifeBalance #Leadership',
 now() - interval '3 days'),

('20000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000006',
 'Joined 6 clubs at activities night and have been to zero meetings',
 'Thrilled to share that I now hold six concurrent club memberships, each with 0% attendance. 📋

True leadership is knowing when not to show up. Open to board positions. #Involvement #Leadership #Overcommitted',
 now() - interval '4 days');

-- ---------- REACTIONS ----------
insert into post_reactions (post_id, user_id, reaction)
select po.id, p.id,
       (array['oof','lol','rip','ggez','chudmaxxing','twin','W','real'])[(abs(hashtext(po.id::text || p.handle)) % 8) + 1]
from posts po cross join profiles p
where p.id <> po.user_id
  and abs(hashtext(p.handle || po.id::text)) % 4 <> 0;

-- ---------- EVENTS ----------
insert into events (id, title, org, starts_at, location, description, place_id, source) values
('30000000-0000-0000-0000-000000000001','Science Games 2027','SUS','2027-01-23 10:00-05','Burnside Hall','Faculty-wide competition. Face paint mandatory, dignity optional.','10000000-0000-0000-0000-000000000005','manual'),
('30000000-0000-0000-0000-000000000002','Gerts Trivia Night','SSMU','2026-11-26 19:00-05','Gerts','Lose at trivia with your friends. Teams of up to 6.','10000000-0000-0000-0000-000000000001','manual'),
('30000000-0000-0000-0000-000000000003','Blues: Last Call Before Finals','SSMU','2026-11-14 22:00-05','Blues','One more night before the library claims you. Again.','10000000-0000-0000-0000-000000000008','manual'),
('30000000-0000-0000-0000-000000000004','E-Week 2027 Kickoff','EUS','2027-02-01 12:00-05','McConnell Engineering','The week engineers do not talk about.','10000000-0000-0000-0000-000000000004','manual'),
('30000000-0000-0000-0000-000000000005','SUS Holiday Social','SUS','2026-11-18 18:00-05','Trottier Building','Hot chocolate, ugly sweaters, avoiding finals.',null,'manual'),
('30000000-0000-0000-0000-000000000006','Finals Survival Night','SUS','2026-12-08 22:00-05','Cafe Campus','One last night out before the library claims you.','10000000-0000-0000-0000-000000000007','manual'),
('30000000-0000-0000-0000-000000000007','Carni 2026','SUS','2026-02-12 12:00-05','Lower Field','Snow, costumes and questionable hydration.','10000000-0000-0000-0000-000000000003','manual'),
('30000000-0000-0000-0000-000000000008','Grad Ball 2027','SUS','2027-04-10 19:00-04','Downtown Montreal','The final boss of McGill events.',null,'manual');

-- ---------- RSVPs ----------
-- demo: two past events still unconfirmed (shows the "Did you attend?" prompt)
insert into rsvps (user_id, event_id, attended) values
('acb41395-a491-4c0e-bcfa-0700bc8c0224','30000000-0000-0000-0000-000000000003',null), -- Blues: Last Call Before Finals (past, has place)
('acb41395-a491-4c0e-bcfa-0700bc8c0224','30000000-0000-0000-0000-000000000005',null), -- Holiday Social (past, no place yet)
('acb41395-a491-4c0e-bcfa-0700bc8c0224','30000000-0000-0000-0000-000000000007',true), -- Carni (already counted)
('acb41395-a491-4c0e-bcfa-0700bc8c0224','30000000-0000-0000-0000-000000000001',null), -- Science Games (upcoming)
('acb41395-a491-4c0e-bcfa-0700bc8c0224','30000000-0000-0000-0000-000000000002',null); -- Trivia (upcoming)

insert into rsvps (user_id, event_id, attended)
select p.id, e.id,
       case when e.starts_at < now() then abs(hashtext(p.handle || e.title)) % 4 <> 0 else null end
from profiles p cross join events e
where p.id <> 'acb41395-a491-4c0e-bcfa-0700bc8c0224'
  and abs(hashtext(e.title || p.handle)) % 3 <> 0;

update profiles set handle = 'amir-qashoua', full_name = 'Amir Qashoua', headline = 'Chief Procrastination Officer | Ex-Attendee of Office Hours', avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/amir.jpeg', program = 'B.Sc. Biology', year = 'U3', worst_grade = 'F (withdrew in spirit)', worst_class = 'CHEM 212: the lab coat is still in the fume hood', hide_grade = 'f' where id = '00000000-0000-0000-0000-000000000002';
update profiles set handle = 'anya-kasuri', full_name = 'Anya Kasuri', headline = 'VP of Showing Up Only to Midterms | Gym Membership Holder (Unused)', avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/anya.png', program = 'B.Eng. Software Engineering', year = 'U2', worst_grade = 'D+', worst_class = 'ECSE 222: the circuit was never complete', hide_grade = 't' where id = '00000000-0000-0000-0000-000000000010';
update profiles set handle = 'brooklyn-barootes', full_name = 'Brooklyn Barootes', headline = 'Thought Leader in Late Submissions | #OpenToNapping', avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/brook.png', program = 'B.Com. Management', year = 'U3', worst_grade = 'D+', worst_class = 'MGCR 211: still unsure what a debit is', hide_grade = 'f' where id = '00000000-0000-0000-0000-000000000005';
update profiles set handle = 'brooklyn-waddell', full_name = 'Brooklyn Waddell', headline = 'Partner @ Cafe Campus | Recovering Overcommitter', avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/brooklyn.png', program = 'B.A. Political Science', year = 'U1', worst_grade = 'C', worst_class = 'POLI 212: read the syllabus in week 11', hide_grade = 'f' where id = '00000000-0000-0000-0000-000000000006';
update profiles set handle = 'ella-rikley', full_name = 'Ella Rikley', headline = 'Professional Lecture Skipper | Gerts Loyalty Program Platinum', avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/ella.jpeg', program = 'B.A. Economics', year = 'U2', worst_grade = 'D', worst_class = 'ECON 208: thought it was reading week', hide_grade = 'f' where id = '00000000-0000-0000-0000-000000000001';
update profiles set handle = 'evan-deng', full_name = 'Evan Deng', headline = 'Founder @ Napping in McLennan | Ex-Science Games MVP', avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/evan.jpeg', program = 'B.Sc. Psychology', year = 'U2', worst_grade = 'C-', worst_class = 'BIOL 112: memorized the wrong chapter', hide_grade = 'f' where id = '00000000-0000-0000-0000-000000000004';
update profiles set handle = 'ishita-kumar', full_name = 'Ishita Kumar', headline = 'Aspiring Nap Specialist | Blues Regular', avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/ishita.png', program = 'B.A. History', year = 'U3', worst_grade = 'D', worst_class = 'HIST 214: confused two wars', hide_grade = 'f' where id = '00000000-0000-0000-0000-000000000008';
update profiles set handle = 'mazen-asali', full_name = 'MazenAsali', headline = 'E-Week Veteran | Opened a Beer With a Lighter (Verified)', avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/mazen.jpeg', program = 'B.Eng. Mechanical Engineering', year = 'U4', worst_grade = 'D-', worst_class = 'MATH 263: the integral won', hide_grade = 'f' where id = '00000000-0000-0000-0000-000000000003';
update profiles set handle = 'sofia-filippov', full_name = 'Sofia Filippov', headline = 'Head of Missing the Add/Drop Deadline | Frosh Leader (Retired)', avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/sofia.jpeg', program = 'B.Sc. Physics', year = 'U4', worst_grade = 'C-', worst_class = 'PHYS 230: the physics did not phys', hide_grade = 'f' where id = '00000000-0000-0000-0000-000000000009';
update profiles set handle = 'sophie-mcbroom', full_name = 'Sophie McB', headline = 'VP of Skipping 8:30s | 3x Add/Drop Survivor | #OpenToNothing', avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/sophie.jpeg', program = 'B.Sc. Computer Science', year = 'U3', worst_grade = 'C- (curved up from D+)', worst_class = 'COMP 251: attended 3 lectures, learned 0 things', hide_grade = 'f' where id = 'acb41395-a491-4c0e-bcfa-0700bc8c0224';
update profiles set handle = 'spencer-jantzen', full_name = 'Spencer Jantzen', headline = 'Full-Stack Procrastinator | COMP 202 Survivor', avatar_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/spencer.png', program = 'B.Sc. Computer Science', year = 'U2', worst_grade = 'F', worst_class = 'COMP 202: infinite loop, infinite regret', hide_grade = 'f' where id = '00000000-0000-0000-0000-000000000007';

-- free up 3 people so "People You May Know" has suggestions for the demo user
delete from endorsements e using skills s
where e.skill_id = s.id
  and s.user_id = 'acb41395-a491-4c0e-bcfa-0700bc8c0224'
  and e.endorser_id in ('00000000-0000-0000-0000-000000000007',
                        '00000000-0000-0000-0000-000000000008',
                        '00000000-0000-0000-0000-000000000009');
delete from connections
where user_b = 'acb41395-a491-4c0e-bcfa-0700bc8c0224'
  and user_a in ('00000000-0000-0000-0000-000000000007',
                 '00000000-0000-0000-0000-000000000008',
                 '00000000-0000-0000-0000-000000000009');

-- spread reaction times after each post, so notifications look natural
update post_reactions r
set created_at = p.created_at + (abs(hashtext(r.user_id::text || r.post_id::text)) % 180) * interval '1 minute'
from posts p where p.id = r.post_id;

-- some "judged your profile" views for the demo user this week
insert into profile_views (viewer_id, viewed_id, viewed_on, viewed_at)
select p.id, 'acb41395-a491-4c0e-bcfa-0700bc8c0224',
       (now() - (abs(hashtext(p.handle)) % 6) * interval '1 day')::date,
       now() - (abs(hashtext(p.handle)) % 6) * interval '1 day'
from profiles p
where p.id <> 'acb41395-a491-4c0e-bcfa-0700bc8c0224'
  and abs(hashtext(p.handle || 'view')) % 3 <> 0
on conflict do nothing;
-- live demo story (account switcher):
--   Ella (01): already an accepted enabler of demo, none of her skills endorsed
--              by demo yet -> every Endorse button on her profile works right away
--   Evan (04): NOT connected to demo -> connect live, switch to Evan, accept
insert into connections (user_a, user_b, status) values
  ('00000000-0000-0000-0000-000000000001', 'acb41395-a491-4c0e-bcfa-0700bc8c0224', 'accepted')
on conflict (user_a, user_b) do update set status = 'accepted';
delete from endorsements e using skills s
where e.skill_id = s.id
  and e.endorser_id = 'acb41395-a491-4c0e-bcfa-0700bc8c0224'
  and s.user_id = '00000000-0000-0000-0000-000000000001';

-- disconnect Evan from demo (both directions), and drop endorsements between
-- them, since only enablers can endorse
delete from endorsements e using skills s
where e.skill_id = s.id
  and ((s.user_id = 'acb41395-a491-4c0e-bcfa-0700bc8c0224' and e.endorser_id = '00000000-0000-0000-0000-000000000004')
    or (s.user_id = '00000000-0000-0000-0000-000000000004' and e.endorser_id = 'acb41395-a491-4c0e-bcfa-0700bc8c0224'));
delete from connections
where (user_a = '00000000-0000-0000-0000-000000000004' and user_b = 'acb41395-a491-4c0e-bcfa-0700bc8c0224')
   or (user_a = 'acb41395-a491-4c0e-bcfa-0700bc8c0224' and user_b = '00000000-0000-0000-0000-000000000004');

-- ---------- PLACE LOGOS ----------
update places set logo_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/logos/gerts.jpeg'        where id = '10000000-0000-0000-0000-000000000001';
update places set logo_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/logos/bda.png'           where id = '10000000-0000-0000-0000-000000000002';
update places set logo_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/logos/carni.jpg'         where id = '10000000-0000-0000-0000-000000000003';
update places set logo_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/logos/e-week.jpg'        where id = '10000000-0000-0000-0000-000000000004';
update places set logo_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/logos/science-games.jpg' where id = '10000000-0000-0000-0000-000000000005';
update places set logo_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/logos/cafe-campus.png'   where id = '10000000-0000-0000-0000-000000000007';
update places set logo_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/logos/blues.jpeg'        where id = '10000000-0000-0000-0000-000000000008';
update places set logo_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/logos/the-lab.jpeg'      where id = '10000000-0000-0000-0000-000000000009';
-- ---------- EVENT REVIEWS (needs supabase/migrations/2026-11-21_event_reviews.sql + 2026-11-22_review_categories.sql) ----------
-- seed attendees of past events leave a review; demo has none, so it can review live
insert into event_reviews (event_id, user_id, rating, body, created_at, vibes, drinks, music, line_wait)
select r.event_id, r.user_id,
       (array[5,4,5,2,3,5,1,4,3,5,4,2])[k.i],
       (array[
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
       ])[k.i],
       e.starts_at + (abs(hashtext(r.user_id::text || e.title)) % 40 + 6) * interval '1 hour',
       -- sub-ratings: the overall rating, nudged up or down by one (kept within 1-5)
       least(5, greatest(1, (array[5,4,5,2,3,5,1,4,3,5,4,2])[k.i] + (abs(hashtext(r.user_id::text || e.title || 'v')) % 3) - 1)),
       least(5, greatest(1, (array[5,4,5,2,3,5,1,4,3,5,4,2])[k.i] + (abs(hashtext(r.user_id::text || e.title || 'd')) % 3) - 1)),
       least(5, greatest(1, (array[5,4,5,2,3,5,1,4,3,5,4,2])[k.i] + (abs(hashtext(r.user_id::text || e.title || 'm')) % 3) - 1)),
       1 + abs(hashtext(r.user_id::text || e.title || 'l')) % 5
from rsvps r
join events e on e.id = r.event_id
cross join lateral (select (abs(hashtext(r.user_id::text || e.title || 'review')) % 12) + 1 as i) k
where r.attended
  and e.starts_at < now()
  and r.user_id <> 'acb41395-a491-4c0e-bcfa-0700bc8c0224'
  and abs(hashtext(e.title || r.user_id::text || 'rev')) % 5 <> 0;

-- ---------- PROFILE BANNERS ----------
-- file names are case-sensitive (sophiebanner.JPG)
update profiles set banner_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/banners/sophiebanner.JPG'
where id = 'acb41395-a491-4c0e-bcfa-0700bc8c0224';
update profiles set banner_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/banners/ellabanner.png'
where id = '00000000-0000-0000-0000-000000000001';
update profiles set banner_url = 'https://gesgzgtrvrjytnimukbw.supabase.co/storage/v1/object/public/avatars/banners/ellabanner.png'
where id = '00000000-0000-0000-0000-000000000004';

-- ---------- WORST CLASSES (needs supabase/migrations/2026-11-21_worst_classes_skill_posts.sql) ----------
insert into worst_classes (user_id, course, grade, created_at)
select id, worst_class, worst_grade, now() - interval '30 days'
from profiles where worst_class is not null;

insert into worst_classes (user_id, course, grade, created_at) values
('acb41395-a491-4c0e-bcfa-0700bc8c0224', 'MATH 240: the proofs proved me wrong', 'C+ (after 3 appeals)', now() - interval '20 days'),
('acb41395-a491-4c0e-bcfa-0700bc8c0224', 'PSYC 100: diagnosed myself with everything', 'B- (generous)', now() - interval '10 days');

-- ---------- SKILL POSTS ("X added a new skill", endorsable from the feed) ----------
-- Ella is demo's enabler -> demo sees an Endorse button; Evan isn't -> "Connect"
insert into posts (user_id, skill_id, raw_text, ai_text, created_at)
select s.user_id, s.id, s.name,
       'I''m excited to share that I''ve added a new skill to my profile: ' || s.name || '. 🎯' || E'\n\n' ||
       'Years of dedicated practice led to this moment. Grateful to every enabler who made it possible.' || E'\n\n' ||
       'Endorsements welcome. #NewSkill #Growth #LockedOut',
       now() - x.ago
from (values ('00000000-0000-0000-0000-000000000001'::uuid, interval '40 minutes'),
             ('00000000-0000-0000-0000-000000000004'::uuid, interval '3 hours')) x(user_id, ago)
cross join lateral (select id, name, user_id from skills where user_id = x.user_id order by name limit 1) s;

-- ---------- ANONYMOUS CONFESSIONS (needs supabase/migrations/2026-11-21_anonymous_posts.sql) ----------
-- posts.user_id is NULL; the real author is only in anonymous_posts (readable by them alone)
with c(id, author, raw, ai, ago) as (values
  ('20000000-0000-0000-0000-0000000000a1'::uuid, '00000000-0000-0000-0000-000000000007'::uuid,
   'I have never once done the readings and I am in U3',
   'After three years of rigorous self-directed learning, I''m proud to confirm I have completed 0% of assigned readings. 📚' || E'\n\n' ||
   'Some call it unprepared. I call it lean methodology.' || E'\n\n' || '#Confession #Efficiency #NoRegrets', interval '25 minutes'),
  ('20000000-0000-0000-0000-0000000000a2'::uuid, '00000000-0000-0000-0000-000000000003'::uuid,
   'I cried in the Trottier bathroom after a midterm and then went to Gerts',
   'Today I practiced radical emotional transparency in the Trottier washrooms, then immediately pivoted to a stakeholder debrief at Gerts. 🍺' || E'\n\n' ||
   'Resilience is not about not falling. It''s about falling, then getting a pitcher.' || E'\n\n' || '#Confession #Resilience #WorkLifeBalance', interval '6 hours')
), ins as (
  insert into posts (id, user_id, raw_text, ai_text, created_at)
  select id, null, raw, ai, now() - ago from c
  returning id
)
insert into anonymous_posts (post_id, user_id)
select c.id, c.author from c join ins on ins.id = c.id;

insert into post_reactions (post_id, user_id, reaction, created_at)
select po.id, p.id,
       (array['oof','lol','rip','twin','real'])[(abs(hashtext(po.id::text || p.handle)) % 5) + 1],
       po.created_at + interval '5 minutes'
from posts po cross join profiles p
where po.user_id is null
  and abs(hashtext(p.handle || po.id::text)) % 3 <> 0;

-- ---------- ODDS STARTER LINES (needs supabase/migrations/2026-11-22_odds.sql, PR #41) ----------
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
