"use client";

import { useActionState } from "react";
import { addEvent, type FormState } from "./actions";

const initial: FormState = { values: {} };
const input = "w-full rounded border border-gray-300 p-2 text-sm text-gray-900";

export default function AdminEventForm({
  places,
}: {
  places: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(addEvent, initial);
  const v = state.values;

  return (
    <form action={formAction} className="space-y-3">
      {state.ok && (
        <p className="rounded bg-green-50 p-2 text-sm text-green-800">Event added ✓</p>
      )}
      {state.error && (
        <p className="rounded bg-red-50 p-2 text-sm text-red-800">{state.error}</p>
      )}

      <input name="title" defaultValue={v.title ?? ""} placeholder="Title (e.g. Science Games Competitor)" required className={input} />
      <input name="org" defaultValue={v.org ?? ""} placeholder="Organization (e.g. SUS)" className={input} />
      <input name="location" defaultValue={v.location ?? ""} placeholder="Location" className={input} />
      <div className="flex gap-2">
        <input name="date" type="date" defaultValue={v.date ?? ""} required className={input} />
        <input name="time" type="time" defaultValue={v.time ?? "19:00"} required className={input} />
      </div>
      <textarea name="description" defaultValue={v.description ?? ""} placeholder="Description" rows={3} className={input} />
      <select name="place_id" defaultValue={v.place_id ?? ""} className={input}>
        <option value="">No place (won&apos;t add to Experience)</option>
        {places.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <input name="secret" type="password" placeholder="Admin secret" required className={input} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
      >
        {pending ? "Posting..." : "Post job"}
      </button>
    </form>
  );
}