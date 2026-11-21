import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Created on first use, so builds and pages that never touch the admin client
// don't need SUPABASE_SERVICE_ROLE_KEY.
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set (only needed for the admin form)");
  }
  return createClient<Database>(url, key, { auth: { persistSession: false } });
}

