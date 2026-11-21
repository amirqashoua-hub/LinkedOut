import { Suspense } from "react";
import { getEvents, getPendingAttendance } from "@/lib/data";
import EventCard from "@/components/EventCard";
import AttendancePrompt from "@/components/AttendancePrompt";

// The page only lays things out. Data loading happens inside <Suspense>.
export default function JobsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <h1 className="text-xl font-semibold text-gray-900">
        Jobs you may be interested in
      </h1>
      <Suspense fallback={<JobsSkeleton />}>
        <JobsContent />
      </Suspense>
    </div>
  );
}

async function JobsContent() {
  const [events, pending] = await Promise.all([getEvents(), getPendingAttendance()]);
  const now = Date.now();

  const upcoming = events
    .filter((e) => new Date(e.starts_at).getTime() > now)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  return (
    <>
      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-600">Needs your attention</h2>
          {pending.map((e) => (
            <AttendancePrompt key={e.id} eventId={e.id} title={e.title} />
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

function JobsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-[100px] animate-pulse rounded-lg border bg-card" />
      <div className="h-[140px] animate-pulse rounded-lg border bg-card" />
      <div className="h-[140px] animate-pulse rounded-lg border bg-card" />
    </div>
  );
}