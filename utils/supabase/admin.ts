import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Service-role client: bypasses RLS. Server-only.
// Created lazily (on first call, not at import time) so a missing
// SUPABASE_SERVICE_ROLE_KEY only breaks the admin page, not the whole build.
let client: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
      );
    }
    client = createClient<Database>(url, key, {
      auth: { persistSession: false },
    });
  }
  return client;
}
