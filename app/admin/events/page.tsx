import { Suspense } from "react";
import { connection } from "next/server";
import { getSupabaseAdmin } from "@/utils/supabase/admin";
import AdminEventForm from "./AdminEventForm";

async function FormWithPlaces() {
  await connection(); // run at request time, never during `next build`
  const { data: places } = await getSupabaseAdmin()
    .from("places")
    .select("id, name")
    .order("name");
  return <AdminEventForm places={places ?? []} />;
}

export default function AdminEventsPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <h1 className="text-xl font-semibold text-gray-900">Post a new job (event)</h1>
      <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
        <FormWithPlaces />
      </Suspense>
    </div>
  );
}
