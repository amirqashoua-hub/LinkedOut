import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Bookmark, ClipboardList, Bell, SlidersHorizontal } from "lucide-react";
import { getEvents, getPendingAttendance } from "@/lib/data";
import EventCard from "@/components/EventCard";
import AttendancePrompt from "@/components/AttendancePrompt";
import RightSidebar from "@/components/RightSidebar";
import Stars from "@/components/Stars";

export const metadata: Metadata = { title: "Events" };

const MY_EVENTS = [
  { icon: Bookmark, label: "My events" },
  { icon: ClipboardList, label: "Application tracker" },
  { icon: Bell, label: "Event alerts" },
  { icon: SlidersHorizontal, label: "Regret preferences" },
];

// Same 3-column grid as the home page. Data loads inside <Suspense>.
export default function EventsPage() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[225px_minmax(0,1fr)] lg:grid-cols-[225px_minmax(0,1fr)_300px]">
      {/* Left: static "My events" menu */}
      <aside className="hidden md:block">
        <nav className="rounded-lg border bg-card py-2">
          {MY_EVENTS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Icon className="h-5 w-5" />
              {label}
            </div>
          ))}
        </nav>

        {/* Past events with their ratings, right under the menu so they're visible */}
        <Suspense fallback={<div className="mt-2 h-[220px] animate-pulse rounded-lg border bg-card" />}>
          <SidebarPastGigs />
        </Suspense>
      </aside>

      <section className="space-y-2">
        <Suspense fallback={<EventsSkeleton />}>
          <EventsContent />
        </Suspense>
      </section>

      <RightSidebar />
    </div>
  );
}

async function EventsContent() {
  const [events, pending] = await Promise.all([getEvents(), getPendingAttendance()]);
  const now = Date.now();

  const upcoming = events
    .filter((e) => new Date(e.starts_at).getTime() > now)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  const past = pastEvents(events);

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

      {/* Event listings */}
      <div className="rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <h1 className="text-xl font-semibold">Top event picks for you</h1>
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

      {/* On small screens the sidebar is hidden, so show Past gigs here instead */}
      <div className="md:hidden">
        <PastGigs past={past} />
      </div>
    </>
  );
}

type EventRow = Awaited<ReturnType<typeof getEvents>>[number];

// Past events, most recent first: these get reviews
function pastEvents(events: EventRow[]) {
  const now = Date.now();
  return events
    .filter((e) => new Date(e.starts_at).getTime() <= now)
    .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
}

async function SidebarPastGigs() {
  const past = pastEvents(await getEvents());
  return (
    <div className="mt-2">
      <PastGigs past={past} />
    </div>
  );
}

// Compact list (fits the 225px sidebar): title, then rating on its own line
function PastGigs({ past }: { past: EventRow[] }) {
  if (past.length === 0) return null;
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="text-base font-semibold">Past gigs</h2>
        <p className="text-xs text-muted-foreground">Reviews from former employees</p>
      </div>
      <ul className="divide-y">
        {past.map((e) => (
          <li key={e.id}>
            <Link href={`/events/${e.id}`} className="block px-4 py-3 hover:bg-accent">
              <p className="text-sm font-semibold leading-snug text-primary">{e.title}</p>
              {e.reviewCount > 0 ? (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{e.avgRating?.toFixed(1)}</span>
                  <Stars value={e.avgRating ?? 0} size={12} />
                  <span>({e.reviewCount})</span>
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">No reviews yet</p>
              )}
            </Link>
          </li>
        ))}
      </ul>
      <p className="border-t px-4 py-2 text-xs text-muted-foreground">Went to one? Confirm it to leave a review.</p>
    </div>
  );
}

function EventsSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-[120px] animate-pulse rounded-lg border bg-card" />
      <div className="h-[420px] animate-pulse rounded-lg border bg-card" />
    </div>
  );
}