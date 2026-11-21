import type { Metadata } from "next";
import { Suspense } from "react";
import { Bookmark, ClipboardList, Bell, SlidersHorizontal } from "lucide-react";
import { getEvents, getPendingAttendance } from "@/lib/data";
import EventCard from "@/components/EventCard";
import AttendancePrompt from "@/components/AttendancePrompt";
import RightSidebar from "@/components/RightSidebar";

export const metadata: Metadata = { title: "Jobs" };

const MY_JOBS = [
  { icon: Bookmark, label: "My jobs" },
  { icon: ClipboardList, label: "Application tracker" },
  { icon: Bell, label: "Job alerts" },
  { icon: SlidersHorizontal, label: "Regret preferences" },
];

// Same 3-column grid as the home page. Data loads inside <Suspense>.
export default function JobsPage() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[225px_minmax(0,1fr)] lg:grid-cols-[225px_minmax(0,1fr)_300px]">
      {/* Left: static "My jobs" menu */}
      <aside className="hidden md:block">
        <nav className="rounded-lg border bg-card py-2">
          {MY_JOBS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Icon className="h-5 w-5" />
              {label}
            </div>
          ))}
        </nav>
      </aside>

      <section className="space-y-2">
        <Suspense fallback={<JobsSkeleton />}>
          <JobsContent />
        </Suspense>
      </section>

      <RightSidebar />
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
      {/* Past events you RSVP'd to: the RSVP → Experience loop */}
      {pending.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <h2 className="text-base font-semibold">Needs your attention</h2>
            <p className="text-xs text-muted-foreground">Confirm your attendance to update your Experience</p>
          </div>
          <ul className="divide-y">
            {pending.map((e) => (
              <AttendancePrompt key={e.id} eventId={e.id} title={e.title} />
            ))}
          </ul>
        </div>
      )}

      {/* Job listings */}
      <div className="rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <h1 className="text-xl font-semibold">Top job picks for you</h1>
          <p className="text-xs text-muted-foreground">
            Based on your profile, your search history and your poor decisions
          </p>
        </div>

        {upcoming.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            No openings right now. Check back after Frosh.
          </p>
        ) : (
          <ul className="divide-y">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function JobsSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-[120px] animate-pulse rounded-lg border bg-card" />
      <div className="h-[420px] animate-pulse rounded-lg border bg-card" />
    </div>
  );
}