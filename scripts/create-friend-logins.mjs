// Real logins for friends, with their own email and a random password.
//
//   1. Copy scripts/friends.example.json to scripts/friends.local.json (git-ignored, stays on your Mac)
//      and list your friends: { "handle": "...", "email": "..." }.
//      - handle of an EXISTING profile (e.g. "brooklyn-waddell"): the login is linked to that profile,
//        so they keep their photo, Experience, posts, skills…
//      - a NEW handle: add "full_name" too; a fresh profile is created for them.
//      - optional "password": use this instead of a random one.
//   2. node --env-file=.env.local scripts/create-friend-logins.mjs
//   3. Send each person their email + password privately. They sign in at /login.
//
// Safe to re-run: existing logins get the email/password from the file (a new random one if none given).
// Needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.

import { readFileSync } from "node:fs";
import { randomInt } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const FILE = new URL("./friends.local.json", import.meta.url);
// These are shared demo accounts (anyone can switch into them from the Me menu): never give them a private login
const DEMO_HANDLES = ["sophie-mcbroom", "ella-rikley", "evan-deng", "amir-qashoua"];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

let friends;
try {
  friends = JSON.parse(readFileSync(FILE, "utf8"));
} catch (e) {
  console.error("Couldn't read scripts/friends.local.json. Copy scripts/friends.example.json and fill it in.\n", e.message);
  process.exit(1);
}

// 12 characters, no look-alikes (0/O, 1/l/I)
function randomPassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 12 }, () => chars[randomInt(chars.length)]).join("");
}

const db = createClient(url, key, { auth: { persistSession: false } });
const results = [];

for (const f of friends) {
  const handle = String(f.handle ?? "").trim();
  const email = String(f.email ?? "").trim();
  if (!handle || !email) {
    results.push([handle || "?", email || "?", "", "✗ needs handle and email"]);
    continue;
  }
  if (DEMO_HANDLES.includes(handle)) {
    results.push([handle, email, "", "✗ skipped: shared demo account (remove it from DEMO_ACCOUNTS first)"]);
    continue;
  }
  const password = f.password ? String(f.password) : randomPassword();

  const { data: profile, error: pErr } = await db.from("profiles").select("id, full_name").eq("handle", handle).maybeSingle();
  if (pErr) {
    results.push([handle, email, "", `✗ ${pErr.message}`]);
    continue;
  }

  if (profile) {
    // existing profile: the login gets the profile's id, so they're linked
    const { data: existing } = await db.auth.admin.getUserById(profile.id);
    const { error } = existing?.user
      ? await db.auth.admin.updateUserById(profile.id, { email, password, email_confirm: true })
      : await db.auth.admin.createUser({ id: profile.id, email, password, email_confirm: true });
    results.push([handle, email, error ? "" : password, error ? `✗ ${error.message}` : existing?.user ? "✓ updated" : "✓ login created"]);
  } else {
    // new person: login first, then a profile with the same id
    const fullName = String(f.full_name ?? "").trim();
    if (!fullName) {
      results.push([handle, email, "", "✗ no profile with that handle: add \"full_name\" to create one"]);
      continue;
    }
    const { data: created, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !created?.user) {
      results.push([handle, email, "", `✗ ${error?.message ?? "couldn't create login"}`]);
      continue;
    }
    const { error: insErr } = await db.from("profiles").insert({ id: created.user.id, handle, full_name: fullName });
    if (insErr) {
      await db.auth.admin.deleteUser(created.user.id); // don't leave a login without a profile
      results.push([handle, email, "", `✗ profile: ${insErr.message}`]);
      continue;
    }
    results.push([handle, email, password, "✓ new profile + login"]);
  }
}

console.log("\nSend each person their email + password privately. They sign in at /login.\n");
console.table(results.map(([handle, email, password, status]) => ({ handle, email, password, status })));
