"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/utils/supabase/admin";

export type FormState = {
  error?: string;
  ok?: boolean;
  values: Record<string, string>;
};

// Turn "2026-12-05" + "19:00" (Montreal wall-clock time) into a UTC ISO string
function montrealToISO(date: string, time: string): string | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{2}):(\d{2})/.exec(time);
  if (!d || !t) return null;

  const asUTC = Date.UTC(+d[1], +d[2] - 1, +d[3], +t[1], +t[2]);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Montreal",
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
      .formatToParts(new Date(asUTC))
      .map((p) => [p.type, p.value])
  );
  const shown = Date.UTC(
    +parts.year,
    +parts.month - 1,
    +parts.day,
    +parts.hour,
    +parts.minute
  );
  const result = new Date(asUTC - (shown - asUTC));
  return Number.isNaN(result.getTime()) ? null : result.toISOString();
}

export async function addEvent(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  // Everything except the secret is sent back so the form keeps what you typed
  const values = {
    title: get("title"),
    org: get("org"),
    location: get("location"),
    description: get("description"),
    date: get("date"),
    time: get("time"),
    place_id: get("place_id"),
  };

  if (!process.env.ADMIN_SECRET || get("secret") !== process.env.ADMIN_SECRET) {
    return { error: "Wrong admin secret", values };
  }
  if (!values.title) return { error: "Title is required", values };

  const startsAt = montrealToISO(values.date, values.time);
  if (!startsAt) return { error: "Invalid date or time", values };

  const { error } = await getSupabaseAdmin().from("events").insert({
    title: values.title,
    org: values.org || null,
    location: values.location || null,
    description: values.description || null,
    starts_at: startsAt,
    place_id: values.place_id || null,
    source: "manual",
    source_url: null,
  });
  if (error) return { error: error.message, values };

  revalidatePath("/jobs");
  return { ok: true, values: {} }; // success clears the form
}