"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type Reaction =
  "oof" | "lol" | "rip" | "ggez" | "chudmaxxing" | "twin" | "W" | "real";

export type VisitResult = {
  place_id: string;
  count: number;
  title: string;
  previous_title: string | null;
  promoted: boolean;
};

async function authed() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  return { supabase, user };
}

// ---------- auth ----------
export async function signIn(email: string, password: string) {
  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function signInDemo() {
  return signIn(process.env.DEMO_EMAIL!, process.env.DEMO_PASSWORD!);
}

export async function signUp(email: string, password: string, fullName: string, handle: string) {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error || !data.user) throw new Error(error?.message ?? "Sign up failed");
  const { error: pErr } = await supabase.from("profiles")
    .insert({ id: data.user.id, full_name: fullName, handle });
  if (pErr) throw new Error(pErr.message);
  revalidatePath("/", "layout");
}

export async function signOut() {
  const supabase = createClient(await cookies());
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}

// ---------- experience ----------
export async function logVisit(placeId: string, photoUrl?: string): Promise<VisitResult> {
  const { supabase } = await authed();
  const { data, error } = await supabase
    .rpc("log_visit", { p_place_id: placeId, p_photo_url: photoUrl });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  return data as VisitResult;
}

// ---------- events ----------
export async function rsvp(eventId: string) {
  const { supabase, user } = await authed();
  const { error } = await supabase.from("rsvps")
    .insert({ user_id: user.id, event_id: eventId });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function cancelRsvp(eventId: string) {
  const { supabase, user } = await authed();
  await supabase.from("rsvps").delete()
    .eq("user_id", user.id).eq("event_id", eventId);
  revalidatePath("/", "layout");
}

export async function markAttended(eventId: string): Promise<VisitResult> {
  const { supabase } = await authed();
  const { data, error } = await supabase
    .rpc("confirm_attendance", { p_event_id: eventId });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  return data as VisitResult;
}

export async function markNotAttended(eventId: string) {
  const { supabase, user } = await authed();
  await supabase.from("rsvps").update({ attended: false })
    .eq("user_id", user.id).eq("event_id", eventId);
  revalidatePath("/", "layout");
}

// ---------- posts ----------
export async function createPost(rawText: string, aiText: string) {
  const { supabase, user } = await authed();
  const { error } = await supabase.from("posts")
    .insert({ user_id: user.id, raw_text: rawText, ai_text: aiText });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function react(postId: string, reaction: Reaction) {
  const { supabase, user } = await authed();
  const { error } = await supabase.from("post_reactions")
    .upsert({ post_id: postId, user_id: user.id, reaction });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function unreact(postId: string) {
  const { supabase, user } = await authed();
  await supabase.from("post_reactions").delete()
    .eq("post_id", postId).eq("user_id", user.id);
  revalidatePath("/", "layout");
}

// ---------- skills ----------
export async function addSkill(name: string) {
  const { supabase, user } = await authed();
  const { error } = await supabase.from("skills").insert({ user_id: user.id, name });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function endorse(skillId: string) {
  const { supabase, user } = await authed();
  const { error } = await supabase.from("endorsements")
    .insert({ skill_id: skillId, endorser_id: user.id });
  if (error) throw new Error("You can only endorse your enablers");
  revalidatePath("/", "layout");
}

// ---------- enablers ----------
export async function sendConnection(toUserId: string) {
  const { supabase, user } = await authed();
  const { error } = await supabase.from("connections")
    .insert({ user_a: user.id, user_b: toUserId });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function acceptConnection(fromUserId: string) {
  const { supabase, user } = await authed();
  const { error } = await supabase.from("connections")
    .update({ status: "accepted" })
    .eq("user_a", fromUserId).eq("user_b", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}