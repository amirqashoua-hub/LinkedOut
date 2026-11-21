"use client";

import { useState, useTransition } from "react";
import { rsvp, cancelRsvp } from "@/app/actions";
import type { getEvents } from "@/lib/data";

type EventRow = Awaited<ReturnType<typeof getEvents>>[number];

// Fake "applicants" so every listing looks popular: stable per event, plus real RSVPs
function fakeApplicants(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 1000;
  return 40 + (h % 280);
}

export default function EventCard({ event }: { event: EventRow }) {
  const [applied, setApplied] = useState(event.hasRsvped);
  const [pending, startTransition] = useTransition();

  const applicants = fakeApplicants(event.id) + (event.applicants ?? 0) + (applied && !event.hasRsvped ? 1 : 0) - (!applied && event.hasRsvped ? 1 : 0);

  const when = new Date(event.starts_at).toLocaleString("en-CA", {
    timeZone: "America/Montreal",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  function toggle() {
    const next = !applied;
    setApplied(next); // optimistic
    startTransition(async () => {
      try {
        await (next ? rsvp(event.id) : cancelRsvp(event.id));
      } catch {
        setApplied(!next); // roll back if the action fails (e.g. not logged in)
      }
    });
  }

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-blue-700">{event.title}</h3>
      <p className="text-sm text-gray-900">{event.org}</p>
      <p className="text-sm text-gray-600">
        {event.location} · On-site · {when}
      </p>
      {event.description && <p className="mt-2 text-sm text-gray-700">{event.description}</p>}
      <p className="mt-2 text-xs text-gray-500">{applicants} applicants</p>
      <div className="mt-3">
        <button
          onClick={toggle}
          disabled={pending}
          className={
            applied
              ? "rounded-full border border-blue-700 px-4 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              : "rounded-full bg-blue-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-800"
          }
        >
          {applied ? "Applied ✓ (click to withdraw)" : "Easy Apply"}
        </button>
      </div>
    </div>
  );
}