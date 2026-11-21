// Creates (or updates) logins for seed profiles, for the demo account switcher.
// Each login gets the SAME id as its seed profile, so getCurrentUser() finds it.
// All accounts use DEMO_PASSWORD. Safe to re-run.
//
// Run from the repo root (needs SUPABASE_SERVICE_ROLE_KEY + DEMO_PASSWORD in .env.local):
//   node --env-file=.env.local scripts/create-demo-users.mjs

import { createClient } from "@supabase/supabase-js";

const ACCOUNTS = [
  { handle: "ella-rikley", email: "ella@linkedout.app", id: "00000000-0000-0000-0000-000000000001" },
  { handle: "evan-deng", email: "evan@linkedout.app", id: "00000000-0000-0000-0000-000000000004" },
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.DEMO_PASSWORD;
if (!url || !key || !password) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or DEMO_PASSWORD in .env.local");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } }).auth.admin;

for (const a of ACCOUNTS) {
  const { data: existing } = await admin.getUserById(a.id);
  if (existing?.user) {
    const { error } = await admin.updateUserById(a.id, {
      email: a.email,
      password,
      email_confirm: true,
    });
    console.log(error ? `✗ ${a.handle}: ${error.message}` : `✓ ${a.handle}: updated (${a.email})`);
  } else {
    const { error } = await admin.createUser({
      id: a.id,
      email: a.email,
      password,
      email_confirm: true,
    });
    console.log(error ? `✗ ${a.handle}: ${error.message}` : `✓ ${a.handle}: created (${a.email})`);
  }
}
