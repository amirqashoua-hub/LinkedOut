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

export async function getProfile(handle: string) {
  const supabase = await db();
  const { data: profile, error } = await supabase
    .from("profiles").select("*").eq("handle", handle).maybeSingle();
  if (error) throw error;
  if (!profile) return null;

  const [experience, skills, posts, enablers] = await Promise.all([
    supabase.from("experience").select("*")
      .eq("user_id", profile.id).order("count", { ascending: false }),
    supabase.from("skills").select("id, name, endorsements(count)")
      .eq("user_id", profile.id),
    supabase.from("feed").select("*").eq("author_id", profile.id),
    supabase.from("connections").select("*", { count: "exact", head: true })
      .eq("status", "accepted")
      .or(`user_a.eq.${profile.id},user_b.eq.${profile.id}`),
  ]);

  return {
    profile: {
      ...profile,
      worst_grade: profile.hide_grade ? null : profile.worst_grade,
    },
    experience: experience.data ?? [],
    skills: (skills.data ?? [])
      .map((s) => ({
        id: s.id,
        name: s.name,
        endorsements: (s.endorsements as { count: number }[])[0]?.count ?? 0,
      }))
      .sort((a, b) => b.endorsements - a.endorsements),
    posts: posts.data ?? [],
    enablerCount: enablers.count ?? 0,
  };
}

export async function getEvents() {
  const supabase = await db();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: events, error } = await supabase
    .from("events").select("*, rsvps(count)").order("starts_at");
  if (error) throw error;

  let mine: Record<string, boolean | null> = {};
  if (user) {
    const { data } = await supabase
      .from("rsvps").select("event_id, attended").eq("user_id", user.id);
    mine = Object.fromEntries((data ?? []).map((r) => [r.event_id, r.attended]));
  }

  return (events ?? []).map((e) => ({
    ...e,
    applicants: (e.rsvps as { count: number }[])[0]?.count ?? 0,
    hasRsvped: e.id in mine,
  }));
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
  return data ?? [];
}