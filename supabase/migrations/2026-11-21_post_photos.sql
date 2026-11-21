-- =========================================================
-- PHOTOS ON POSTS: posts.photo_url + expose it in the feed view.
-- Run once in the Supabase SQL Editor. Additive: existing posts get photo_url = null.
-- =========================================================

alter table posts add column if not exists photo_url text;

-- Same definition as before, with p.photo_url added as the LAST column
-- (create or replace view only allows adding columns at the end).
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
    p.photo_url
   FROM posts p
     JOIN profiles pr ON pr.id = p.user_id
  ORDER BY p.created_at DESC;
