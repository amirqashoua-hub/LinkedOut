import "server-only";
import { connection } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getSupabaseAdmin } from "@/utils/supabase/admin";

export type Person = {
  id: string;
  handle: string | null;
  name: string;
  avatar_url: string | null;
};

const str = (v: unknown) => (typeof v === "string" && v ? v : null);

// tolerant of column names until we confirm them
function toPerson(p: Record<string, unknown>): Person {
  return {
    id: String(p.id),
    handle: str(p.handle),
    name: str(p.full_name) ?? str(p.name) ?? str(p.display_name) ?? str(p.handle) ?? "Someone",
    avatar_url: str(p.avatar_url) ?? str(p.avatar) ?? str(p.image_url),
  };
}

// Who is going to each event (newest RSVPs first). Uses the admin client because
// RLS probably only lets people read their own RSVPs; only public profile fields leave here.
export async function getAttendeesByEvent(
  eventIds: string[],
  perEvent = 5
): Promise<Record<string, Person[]>> {
  await connection();
  if (eventIds.length === 0) return {};
  const admin = getSupabaseAdmin();

  const { data: rsvps, error } = await admin
    .from("rsvps")
    .select("event_id, user_id, created_at")
    .in("event_id", eventIds)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const userIds = [...new Set((rsvps ?? []).map((r) => r.user_id))];
  if (userIds.length === 0) return {};

  const { data: profiles, error: pErr } = await admin
    .from("profiles")
    .select("*")
    .in("id", userIds);
  if (pErr) throw pErr;

  const byId = new Map(
    (profiles ?? []).map((p) => [p.id, toPerson(p as Record<string, unknown>)])
  );
  const out: Record<string, Person[]> = {};
  for (const r of rsvps ?? []) {
    const person = byId.get(r.user_id);
    if (!person) continue;
    const list = (out[r.event_id] ??= []);
    if (list.length < perEvent) list.push(person);
  }
  return out;
}

export type PlanEvent = {
  id: string;
  title: string;
  org: string | null;
  location: string | null;
  starts_at: string | null;
  source: string | null;
  source_url: string | null;
};

// The logged-in user's own RSVPs, soonest first
export async function getMyPlans(): Promise<{ loggedIn: boolean; plans: PlanEvent[] }> {
  const supabase = await createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { loggedIn: false, plans: [] };

  const { data, error } = await supabase
    .from("rsvps")
    .select("events!inner(id, title, org, location, starts_at, source, source_url)")
    .eq("user_id", user.id);
  if (error) throw error;

  const plans = (data ?? [])
    .map((r) => r.events as unknown as PlanEvent)
    .sort(
      (a, b) =>
        new Date(a.starts_at ?? 0).getTime() - new Date(b.starts_at ?? 0).getTime()
    );
  return { loggedIn: true, plans };
}

// Upcoming events someone is going to, for their public profile
export async function getGoingTo(userId: string, limit = 5): Promise<PlanEvent[]> {
  await connection();
  const { data, error } = await getSupabaseAdmin()
    .from("rsvps")
    .select("events!inner(id, title, org, location, starts_at, source, source_url)")
    .eq("user_id", userId);
  if (error) throw error;

  const now = Date.now();
  return (data ?? [])
    .map((r) => r.events as unknown as PlanEvent)
    .filter((e) => e.starts_at && new Date(e.starts_at).getTime() > now)
    .sort((a, b) => new Date(a.starts_at!).getTime() - new Date(b.starts_at!).getTime())
    .slice(0, limit);
}