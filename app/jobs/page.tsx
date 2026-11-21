import { Suspense } from "react";
import { getEvents, getPendingAttendance } from "@/lib/data";
import EventCard from "@/components/EventCard";
import AttendancePrompt from "@/components/AttendancePrompt";

async function JobsContent() {
  const [events, pending] = await Promise.all([getEvents(), getPendingAttendance()]);
  const now = Date.now();

  const upcoming = events
    .filter((e) => e.starts_at && new Date(e.starts_at).getTime() > now)
    .sort(
      (a, b) =>
        new Date(a.starts_at ?? 0).getTime() - new Date(b.starts_at ?? 0).getTime()
    );

  return (
    <>
      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-600">Needs your attention</h2>
          {pending.map((p) => (
            <AttendancePrompt
              key={p.event_id}
              eventId={p.event_id}
              title={p.events.title}
            />
          ))}
        </section>
      )}

      {upcoming.length === 0 && (
        <p className="text-sm text-gray-500">
          No openings right now. Check back after Frosh.
        </p>
      )}
      {upcoming.map((e) => (
        <EventCard key={e.id} event={e} />
      ))}
    </>
  );
}

export default function JobsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <h1 className="text-xl font-semibold text-gray-900">
        Jobs you may be interested in
      </h1>
      <Suspense fallback={<p className="text-sm text-gray-500">Loading jobs…</p>}>
        <JobsContent />
      </Suspense>
    </div>
  );
}
