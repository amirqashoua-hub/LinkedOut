"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { REVIEW_CATEGORIES, type CategoryKey, type CategoryRatings } from "@/lib/reviews";
import { BIO_MAX, NAME_MAX, HEADLINE_MAX } from "@/lib/profile";

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
  const { supabase, user } = await authed();
  const { data, error } = await supabase
    .rpc("log_visit", { p_place_id: placeId, p_photo_url: photoUrl });
  if (error) throw new Error(error.message);
  const visit = data as VisitResult;

  // A +1 with photo evidence is also posted to the feed (best effort: the visit counts either way)
  if (photoUrl) {
    const { data: place } = await supabase.from("places").select("name").eq("id", placeId).maybeSingle();
    const name = place?.name ?? "the venue";
    const tag = name.replace(/[^A-Za-z0-9]/g, "");
    const aiText = visit.promoted && visit.previous_title
      ? `I'm thrilled to share that I've been promoted to ${visit.title} at ${name}! 🎉\n\n` +
        `Visit #${visit.count}. Grateful to the bartenders, the bouncer and my liver for believing in me.\n\n` +
        `#Promoted #${tag} #CareerGrowth`
      : visit.promoted
        ? `Excited to announce I've joined ${name} as ${visit.title}! 🎉\n\n` +
          `Photo evidence of my first day attached. Looking forward to growing with the team.\n\n` +
          `#NewBeginnings #${tag} #OpenToWork`
        : `Another productive shift at ${name}. 📸\n\n` +
          `Visit #${visit.count} as ${visit.title}. Consistency is a leadership trait.\n\n` +
          `#${tag} #Grind #Evidence`;
    const { error: postError } = await supabase.from("posts").insert({
      user_id: user.id,
      raw_text: `+1 at ${name} (visit ${visit.count})`,
      ai_text: aiText,
      photo_url: photoUrl,
    });
    if (postError) console.error("logVisit: couldn't post the photo:", postError.code, postError.message);
  }

  revalidatePath("/", "layout");
  return visit;
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
  body: string,
  categories: CategoryRatings = {}
): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to leave a review" };

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Pick 1 to 5 stars" };
  }
  const text = body.trim();
  if (text.length > 500) return { error: "Keep it under 500 characters" };

  // optional sub-ratings: whole numbers 1-5, anything else is "not rated"
  const sub = Object.fromEntries(
    REVIEW_CATEGORIES.map(({ key }) => {
      const v = categories[key];
      return [key, Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 5 ? v : null];
    })
  ) as Record<CategoryKey, number | null>;

  // insert or replace my review (one per person per event)
  const row = { event_id: eventId, user_id: user.id, rating, body: text || null, created_at: new Date().toISOString() };
  let { error } = await supabase.from("event_reviews").upsert({ ...row, ...sub }, { onConflict: "event_id,user_id" });
  // PGRST204 = sub-rating columns not added yet (migration not run): save the main review anyway
  if (error?.code === "PGRST204") {
    ({ error } = await supabase.from("event_reviews").upsert(row, { onConflict: "event_id,user_id" }));
  }
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
// Anonymous confession: the post is stored without an author, so nobody can see who wrote it.
// No photos: a photo (or its storage path) could give the author away.
export async function createAnonymousPost(rawText: string, aiText: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to confess. (We won't tell anyone it was you.)" };

  const { error } = await supabase.rpc("create_anonymous_post", {
    p_raw_text: rawText.trim(),
    p_ai_text: aiText.trim(),
  });
  if (error) {
    console.error("createAnonymousPost failed:", error.code, error.message);
    // PGRST202 = function not found: the migration hasn't been run yet
    return {
      error: error.code === "PGRST202"
        ? "Anonymous posts aren't enabled in the database yet."
        : "Couldn't post your confession. Try again.",
    };
  }
  revalidatePath("/", "layout");
  return {};
}

export async function deletePost(postId: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first" };

  let { error, count } = await supabase.from("posts")
    .delete({ count: "exact" })
    .eq("id", postId).eq("user_id", user.id);

  // Not a signed post of yours? It may be one of your anonymous confessions.
  if (!error && count === 0) {
    const anon = await supabase.rpc("delete_anonymous_post", { p_post_id: postId });
    error = anon.error;
    count = anon.data ? 1 : 0;
  }

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
  const { data: skill, error } = await supabase.from("skills")
    .insert({ user_id: user.id, name: clean }).select("id").single();
  if (error) {
    // 23505 = duplicate (same skill, any capitalisation, once the DB rule is in)
    return {
      error: error.code === "23505"
        ? "You already have that one. Impressive commitment."
        : "Couldn't add that skill",
    };
  }

  // Announce it on the feed, where enablers can endorse it directly.
  // Best effort: the skill is added even if the post fails (e.g. migration not run yet).
  const { error: postError } = await supabase.from("posts").insert({
    user_id: user.id,
    skill_id: skill.id,
    raw_text: clean,
    ai_text:
      `I'm excited to share that I've added a new skill to my profile: ${clean}. 🎯\n\n` +
      `Years of dedicated practice led to this moment. Grateful to every enabler who made it possible.\n\n` +
      `Endorsements welcome. #NewSkill #Growth #LockedOut`,
  });
  if (postError) console.error("addSkill: couldn't create the skill post:", postError.code, postError.message);

  revalidatePath("/", "layout");
  return {};
}

// ---------- worst classes ----------
export async function addWorstClass(course: string, grade: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to edit your classes" };

  const c = course.trim();
  const g = grade.trim();
  if (c.length < 2 || c.length > 80) return { error: "Class must be 2 to 80 characters" };
  if (g.length > 30) return { error: "Grade must be under 30 characters" };

  const { error } = await supabase.from("worst_classes")
    .insert({ user_id: user.id, course: c, grade: g || null });
  if (error) return { error: "Couldn't add that class" };
  revalidatePath("/", "layout");
  return {};
}

export async function removeWorstClass(id: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to edit your classes" };

  const { error, count } = await supabase.from("worst_classes")
    .delete({ count: "exact" }).eq("id", id).eq("user_id", user.id);
  if (error || count === 0) return { error: "Couldn't remove that class" };
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

// ---------- odds (over/unders) ----------
export type OddsPick = "over" | "under";

// Vote Over/Under on a line; pick = null removes your vote
export async function voteOdds(lineId: string, pick: OddsPick | null): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to place your bet" };

  const { error } = pick
    ? await supabase.from("odds_votes").upsert({ line_id: lineId, user_id: user.id, pick })
    : await supabase.from("odds_votes").delete().eq("line_id", lineId).eq("user_id", user.id);
  if (error) {
    console.error("voteOdds failed:", error.code, error.message);
    return { error: "Couldn't place that bet" };
  }
  revalidatePath("/", "layout");
  return {};
}

// Set a new over/under line about yourself
export async function createOddsLine(subject: string, line: number, unit: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to set a line" };

  const cleanSubject = subject.trim();
  const cleanUnit = unit.trim();
  if (cleanSubject.length < 3 || cleanSubject.length > 80) return { error: "Describe it in 3 to 80 characters" };
  if (!Number.isFinite(line) || line < 0 || line >= 100000) return { error: "The line has to be a number from 0 up" };
  if (cleanUnit.length > 20) return { error: "Keep the unit short (20 characters)" };

  const { error } = await supabase.from("odds_lines").insert({
    user_id: user.id,
    subject: cleanSubject,
    line,
    unit: cleanUnit || null,
  });
  if (error) {
    console.error("createOddsLine failed:", error.code, error.message);
    return { error: "Couldn't set that line" };
  }
  revalidatePath("/", "layout");
  return {};
}


export type SettleResult = ActionResult & { outcome?: "over" | "under" | "push" };

// End the betting on your own line with what actually happened; Aura Points follow
export async function settleOddsLine(lineId: string, result: number): Promise<SettleResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first" };
  if (!Number.isFinite(result) || result < 0) return { error: "Enter what actually happened (0 or more)" };

  const { data, error } = await supabase.rpc("settle_odds_line", { p_line_id: lineId, p_result: result });
  if (error) {
    console.error("settleOddsLine failed:", error.code, error.message);
    // The database function's own messages are written for users ("Only the person who set the line…")
    return { error: error.code === "P0001" ? error.message : "Couldn't end the betting" };
  }
  revalidatePath("/", "layout");
  return { outcome: (data as { outcome: "over" | "under" | "push" }).outcome };
}


// ---------- profile ----------
export type ProfileEdits = {
  full_name: string;
  headline: string;
  program: string;
  year: string;
  bio: string;
  avatar_url?: string; // only when a new photo was uploaded
  banner_url?: string; // only when a new banner was uploaded
};


// Edit your own profile (Edit profile dialog). Returns { error } like the other actions.
export async function updateProfile(edits: ProfileEdits): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to edit your profile" };

  const full_name = edits.full_name.trim();
  const headline = edits.headline.trim();
  const program = edits.program.trim();
  const year = edits.year.trim();
  const bio = edits.bio.trim();
  if (full_name.length < 1 || full_name.length > NAME_MAX) return { error: `Name must be 1 to ${NAME_MAX} characters` };
  if (headline.length > HEADLINE_MAX) return { error: `Headline must be ${HEADLINE_MAX} characters or less` };
  if (program.length > 80 || year.length > 20) return { error: "Program or year is too long" };
  if (bio.length > BIO_MAX) return { error: `Bio must be ${BIO_MAX} characters or less` };

  const row = {
    full_name,
    headline: headline || null,
    program: program || null,
    year: year || null,
    bio: bio || null,
    ...(edits.avatar_url ? { avatar_url: edits.avatar_url } : {}),
    ...(edits.banner_url ? { banner_url: edits.banner_url } : {}),
  };

  let { error } = await supabase.from("profiles").update(row).eq("id", user.id);
  if (error?.code === "PGRST204") {
    // bio column not added yet (migration not run): save everything else
    const { bio: _skip, ...withoutBio } = row;
    void _skip;
    ({ error } = await supabase.from("profiles").update(withoutBio).eq("id", user.id));
    if (!error) {
      revalidatePath("/", "layout");
      return { error: "Saved, except the bio: bios aren't enabled in the database yet" };
    }
  }
  if (error) {
    console.error("updateProfile failed:", error.code, error.message);
    return { error: "Couldn't save your profile" };
  }
  revalidatePath("/", "layout");
  return {};
}


// ---------- comments ----------
const COMMENT_MAX = 500;

export async function addComment(postId: string, body: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to comment" };

  const text = body.trim();
  if (text.length === 0) return { error: "Write something first" };
  if (text.length > COMMENT_MAX) return { error: `Comments are ${COMMENT_MAX} characters max` };

  const { error } = await supabase.from("post_comments").insert({ post_id: postId, user_id: user.id, body: text });
  if (error) {
    console.error("addComment failed:", error.code, error.message);
    return {
      error: error.code === "PGRST205" || error.code === "42P01"
        ? "Comments aren't enabled in the database yet"
        : "Couldn't post your comment",
    };
  }
  revalidatePath("/", "layout");
  return {};
}

export async function deleteComment(commentId: string): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first" };

  const { error, count } = await supabase.from("post_comments")
    .delete({ count: "exact" })
    .eq("id", commentId).eq("user_id", user.id);
  if (error || count === 0) {
    console.error("deleteComment failed:", error?.code, error?.message, "rows:", count);
    return { error: "Couldn't delete that comment" };
  }
  revalidatePath("/", "layout");
  return {};
}
