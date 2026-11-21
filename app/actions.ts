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

// Demo account switcher. Only handles listed in DEMO_ACCOUNTS can be used,
// so it can't log anyone into a real account.
// DEMO_ACCOUNTS="sophie-mcbroom:demo@linkedout.app,evan-deng:evan@linkedout.app"
// All demo accounts share DEMO_PASSWORD. Server-only, never sent to the browser.
export async function signInAs(handle: string) {
  const accounts = Object.fromEntries(
    (process.env.DEMO_ACCOUNTS ?? "")
      .split(",")
      .filter(Boolean)
      .map((pair) => pair.trim().split(":").map((s) => s.trim()) as [string, string])
  );
  const email = accounts[handle];
  if (!email) throw new Error("Not a demo account");
  await signIn(email, process.env.DEMO_PASSWORD!);
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

// Remove the photo from one of your own Experience entries (keeps the visit count)
export async function removeVisitPhoto(placeId: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first" };

  const { error, count } = await supabase.from("visits")
    .update({ photo_url: null }, { count: "exact" })
    .eq("user_id", user.id).eq("place_id", placeId);
  if (error || count === 0) {
    console.error("removeVisitPhoto failed:", error?.code, error?.message, "rows:", count);
    return { error: "Couldn't remove the photo" };
  }
  revalidatePath("/", "layout");
  return {};
}

// ---------- events ----------
export async function rsvp(eventId: string) {
    const { supabase, user } = await authed();
    const { error } = await supabase.from("rsvps")
      .upsert({ user_id: user.id, event_id: eventId },
              { onConflict: "user_id,event_id", ignoreDuplicates: true });
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

export async function reviewEvent(
  eventId: string,
  rating: number,
  body: string
): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to leave a review" };

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Pick 1 to 5 stars" };
  }
  const text = body.trim();
  if (text.length > 500) return { error: "Keep it under 500 characters" };

  // insert or replace my review (one per person per event)
  const { error } = await supabase.from("event_reviews").upsert(
    { event_id: eventId, user_id: user.id, rating, body: text || null, created_at: new Date().toISOString() },
    { onConflict: "event_id,user_id" }
  );
  if (error) return { error: "Only verified attendees can review. Say you went first." };
  revalidatePath("/", "layout");
  return {};
}

export async function deleteReview(eventId: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first" };
  const { error } = await supabase.from("event_reviews").delete()
    .eq("event_id", eventId).eq("user_id", user.id);
  if (error) return { error: "Couldn't delete your review" };
  revalidatePath("/", "layout");
  return {};
}

export async function markNotAttended(eventId: string) {
  const { supabase, user } = await authed();
  await supabase.from("rsvps").update({ attended: false })
    .eq("user_id", user.id).eq("event_id", eventId);
  revalidatePath("/", "layout");
}

// ---------- posts ----------
// Returns { error } instead of throwing, so the reason survives production (like addSkill)
export async function createPost(rawText: string, aiText: string, photoUrl?: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to post your failures." };

  // Only send photo_url when there is a photo, so plain posts work even without that column
  const row = { user_id: user.id, raw_text: rawText, ai_text: aiText, ...(photoUrl ? { photo_url: photoUrl } : {}) };
  const { error } = await supabase.from("posts").insert(row);
  if (error) {
    console.error("createPost failed:", error.code, error.message);
    // PGRST204 = column not found: posts.photo_url doesn't exist in the database yet
    return {
      error: error.code === "PGRST204"
        ? "Photos on posts aren't enabled in the database yet. Remove the photo to post."
        : `Couldn't post: ${error.message}`,
    };
  }
  revalidatePath("/", "layout");
  return {};
}

// Delete one of your own posts (reactions go with it if the FK cascades)
export async function deletePost(postId: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first" };

  const { error, count } = await supabase.from("posts")
    .delete({ count: "exact" })
    .eq("id", postId).eq("user_id", user.id);
  if (error || count === 0) {
    console.error("deletePost failed:", error?.code, error?.message, "rows:", count);
    // 23503 = reactions still point at the post (no ON DELETE CASCADE)
    return {
      error: error?.code === "23503"
        ? "Can't delete a post people reacted to (yet)"
        : "Couldn't delete that post",
    };
  }
  revalidatePath("/", "layout");
  return {};
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
export async function addSkill(name: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to add skills" };

  const clean = name.trim();
  if (clean.length < 2 || clean.length > 50) {
    return { error: "Skills must be 2 to 50 characters" };
  }
  const { error } = await supabase.from("skills").insert({ user_id: user.id, name: clean });
  if (error) {
    // 23505 = duplicate (same skill, any capitalisation, once the DB rule is in)
    return {
      error: error.code === "23505"
        ? "You already have that one. Impressive commitment."
        : "Couldn't add that skill",
    };
  }
  revalidatePath("/", "layout");
  return {};
}

// Remove one of your own skills (RLS should only allow deleting your own rows)
export async function removeSkill(skillId: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to edit your skills" };

  const { error, count } = await supabase.from("skills")
    .delete({ count: "exact" })
    .eq("id", skillId).eq("user_id", user.id);
  if (error) {
    // 23503 = still referenced (endorsements without ON DELETE CASCADE)
    return {
      error: error.code === "23503"
        ? "Can't remove a skill people have endorsed (yet)"
        : "Couldn't remove that skill",
    };
  }
  if (count === 0) return { error: "Couldn't remove that skill" };
  revalidatePath("/", "layout");
  return {};
}

export async function unendorse(skillId: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to endorse" };

  const { error } = await supabase.from("endorsements").delete()
    .eq("skill_id", skillId).eq("endorser_id", user.id);
  if (error) return { error: "Couldn't remove the endorsement" };
  revalidatePath("/", "layout");
  return {};
}

// Returns { error } instead of throwing: Next.js hides thrown error messages
// from server actions in production, so the UI would never see the text.
export type ActionResult = { error?: string };

export async function endorse(skillId: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to endorse" };

  const { error } = await supabase.from("endorsements")
    .insert({ skill_id: skillId, endorser_id: user.id });
  // 23505 = already endorsed (duplicate key): that's fine, treat as success
  if (error && error.code !== "23505") {
    return { error: "You can only endorse your enablers" };
  }
  revalidatePath("/", "layout");
  return {};
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

export async function recordProfileView(viewedId: string) {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id === viewedId) return;
    await supabase.from("profile_views")
      .upsert({ viewer_id: user.id, viewed_id: viewedId },
              { onConflict: "viewer_id,viewed_id,viewed_on", ignoreDuplicates: true });
  }