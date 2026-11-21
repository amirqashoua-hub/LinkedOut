import { cookies } from "next/headers";
import { connection } from "next/server";
import { createClient } from "@/utils/supabase/server";

async function db() {
    await connection();
    return createClient(await cookies());
  }

export async function getCurrentUser() {
  const supabase = await db();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).maybeSingle();
  return profile;
}

export async function getFeed() {
  const supabase = await db();
  const { data, error } = await supabase.from("feed").select("*").order("created_at", {ascending: false});
  if (error) throw error;
  return data;
}

// How the logged-in viewer relates to a profile.
// "none" also covers logged-out visitors.
export type ConnectionStatus = "self" | "accepted" | "pending" | "none";

export async function getProfile(handle: string) {
  const supabase = await db();
  const [{ data: profile, error }, { data: { user } }] = await Promise.all([
    supabase.from("profiles").select("*").eq("handle", handle).maybeSingle(),
    supabase.auth.getUser(),
  ]);
  if (error) throw error;
  if (!profile) return null;

  const isSelf = user?.id === profile.id;

  const [experience, skills, posts, enablers, link, places] = await Promise.all([
    supabase.from("experience").select("*")
      .eq("user_id", profile.id).order("count", { ascending: false }),
    // endorser ids give us both the count and "did I endorse this?"
    supabase.from("skills").select("id, name, endorsements(endorser_id)")
      .eq("user_id", profile.id),
    supabase.from("feed").select("*").eq("author_id", profile.id),
    supabase.from("connections").select("*", { count: "exact", head: true })
      .eq("status", "accepted")
      .or(`user_a.eq.${profile.id},user_b.eq.${profile.id}`),
    // the connection between me and this profile, in either direction
    user && !isSelf
      ? supabase.from("connections").select("status")
          .or(`and(user_a.eq.${user.id},user_b.eq.${profile.id}),and(user_a.eq.${profile.id},user_b.eq.${user.id})`)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    // logos live on places; the experience view doesn't include them
    supabase.from("places").select("id, logo_url"),
  ]);

  const logos = new Map((places.data ?? []).map((p) => [p.id, p.logo_url]));

  const connection: ConnectionStatus = isSelf
    ? "self"
    : link.data?.status === "accepted"
      ? "accepted"
      : link.data?.status === "pending"
        ? "pending"
        : "none";

  return {
    profile: {
      ...profile,
      worst_grade: profile.hide_grade ? null : profile.worst_grade,
    },
    experience: (experience.data ?? []).map((e) => ({
      ...e,
      logo_url: e.place_id ? logos.get(e.place_id) ?? null : null,
    })),
    skills: (skills.data ?? [])
      .map((s) => {
        const endorsers = (s.endorsements as { endorser_id: string }[]) ?? [];
        return {
          id: s.id,
          name: s.name,
          endorsements: endorsers.length,
          endorsedByMe: !!user && endorsers.some((e) => e.endorser_id === user.id),
        };
      })
      .sort((a, b) => b.endorsements - a.endorsements),
    posts: posts.data ?? [],
    enablerCount: enablers.count ?? 0,
    connection,
  };
}

export async function getEvents() {
  const supabase = await db();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: events, error } = await supabase
    .from("events").select("*, rsvps(count), event_reviews(rating)").order("starts_at");
  if (error) throw error;

  let mine: Record<string, boolean | null> = {};
  if (user) {
    const { data } = await supabase
      .from("rsvps").select("event_id, attended").eq("user_id", user.id);
    mine = Object.fromEntries((data ?? []).map((r) => [r.event_id, r.attended]));
  }

  return (events ?? []).map(({ event_reviews, ...e }) => ({
    ...e,
    applicants: (e.rsvps as { count: number }[])[0]?.count ?? 0,
    hasRsvped: e.id in mine,
    ...ratingSummary(event_reviews.map((r) => r.rating)),
  }));
}

// { avgRating: 3.7 (or null if no reviews), reviewCount: 12 }
function ratingSummary(ratings: number[]) {
  return {
    avgRating: ratings.length
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null,
    reviewCount: ratings.length,
  };
}

// One event + its reviews (newest first), for /jobs/[id].
// canReview: the viewer said "Yes, I attended". myReview: theirs, if any.
export async function getEventWithReviews(id: string) {
  const supabase = await db();
  const [{ data: event, error }, { data: { user } }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).maybeSingle(),
    supabase.auth.getUser(),
  ]);
  // a malformed id is a "not found", not a crash
  if (error && error.code !== "22P02") throw error;
  if (!event) return null;

  const [reviews, rsvp] = await Promise.all([
    supabase.from("event_reviews")
      .select("rating, body, created_at, user_id, profiles(handle, full_name, headline, avatar_url)")
      .eq("event_id", id)
      .order("created_at", { ascending: false }),
    user
      ? supabase.from("rsvps").select("attended")
          .eq("event_id", id).eq("user_id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  if (reviews.error) throw reviews.error;

  const list = reviews.data ?? [];
  // how many 5-star, 4-star, ... 1-star reviews (index 0 = 5 stars)
  const breakdown = [5, 4, 3, 2, 1].map((stars) => list.filter((r) => r.rating === stars).length);

  return {
    event,
    reviews: list,
    ...ratingSummary(list.map((r) => r.rating)),
    breakdown,
    isPast: new Date(event.starts_at).getTime() < Date.now(),
    canReview: rsvp.data?.attended === true,
    myReview: user ? list.find((r) => r.user_id === user.id) ?? null : null,
  };
}

// past events the user RSVP'd to but hasn't confirmed -> "Did you attend?"
export async function getPendingAttendance() {
  const supabase = await db();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("rsvps")
    .select("event_id, events!inner(id, title, org, starts_at, location)")
    .eq("user_id", user.id)
    .is("attended", null)
    .lt("events.starts_at", new Date().toISOString());
  if (error) throw error;
  return (data ?? []).map((r) => r.events);
}

export async function getPeopleYouMayKnow(limit = 6) {
    const supabase = await db();
    const { data, error } = await supabase.rpc("people_you_may_know", { p_limit: limit });
    if (error) throw error;
    return data ?? [];
  }
  
  export async function getGuiltTrips() {
    const supabase = await db();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { items: [], judgedThisWeek: 0 };
  
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [trips, views] = await Promise.all([
      supabase.rpc("guilt_trips", { p_limit: 30 }),
      supabase.from("profile_views").select("*", { count: "exact", head: true })
        .eq("viewed_id", user.id).gte("viewed_at", weekAgo),
    ]);
    if (trips.error) throw trips.error;
  
    return { items: trips.data ?? [], judgedThisWeek: views.count ?? 0 };
  }