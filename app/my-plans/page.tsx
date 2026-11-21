import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { getMyPlans, getFriendsGoing, type Person } from "@/lib/social";
import Attendees from "@/components/Attendees";
import RightSidebar from "@/components/RightSidebar";

export const metadata: Metadata = { title: "My plans" };

// The events you said "I'm going" to, soonest first, with which of your enablers are going too.
export default function MyPlansPage() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-2">
        <Link href="/events" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to events
        </Link>
        <Suspense fallback={<PlansSkeleton />}>
          <Plans />
        </Suspense>
      </div>
      <RightSidebar />
    </div>
  );
}

function when(iso: string | null) {
  if (!iso) return "Date TBD";
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Montreal",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// "Ella is going" / "Ella and Mazen are going" / "Ella, Mazen and 2 others are going"
function friendsLine(people: Person[]) {
  const names = people.map((p) => p.name.split(" ")[0]);
  if (names.length === 1) return `${names[0]} is going`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are going`;
  const others = names.length - 2;
  return `${names[0]}, ${names[1]} and ${others} other${others > 1 ? "s" : ""} are going`;
}

async function Plans() {
  const { loggedIn, plans } = await getMyPlans();

  if (!loggedIn) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h1 className="text-xl font-semibold">My plans</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in (Me menu) to see the events you&apos;re going to.</p>
      </div>
    );
  }

  const now = Date.now();
  const upcoming = plans.filter((p) => p.starts_at && new Date(p.starts_at).getTime() > now);
  const past = plans.filter((p) => !p.starts_at || new Date(p.starts_at).getTime() <= now).reverse(); // newest first
  const friends = await getFriendsGoing(upcoming.map((p) => p.id)).catch(() => ({}) as Record<string, Person[]>);

  return (
    <>
      <div className="rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <h1 className="text-xl font-semibold">My plans</h1>
          <p className="text-xs text-muted-foreground">
            {upcoming.length === 0
              ? "Nothing coming up. Your liver thanks you."
              : `${upcoming.length} upcoming ${upcoming.length === 1 ? "commitment" : "commitments"} to poor decisions`}
          </p>
        </div>

        {upcoming.length === 0 ? (
          <p className="px-4 py-6 text-sm">
            <Link href="/events" className="font-semibold text-primary hover:underline">
              Browse events
            </Link>{" "}
            and hit &quot;I&apos;m Going&quot; to add some.
          </p>
        ) : (
          <ul className="divide-y">
            {upcoming.map((p) => {
              const going = friends[p.id] ?? [];
              return (
                <li key={p.id} className="px-4 py-4">
                  <Link href={`/events/${p.id}`} className="text-base font-semibold text-primary hover:underline">
                    {p.title}
                  </Link>
                  {p.org && <p className="text-sm">{p.org}</p>}
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" /> {when(p.starts_at)}
                    </span>
                    {p.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {p.location}
                      </span>
                    )}
                  </p>

                  {/* Which of your enablers are going */}
                  {going.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <Attendees people={going.slice(0, 5)} />
                      <p className="mt-3 text-xs text-muted-foreground">{friendsLine(going)}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">None of your enablers are going yet. Recruit some.</p>
                  )}

                  {p.source_url && (
                    <a
                      href={p.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block rounded-full border border-[#666] px-4 py-1 text-sm font-semibold text-muted-foreground hover:bg-accent"
                    >
                      Get tickets ↗
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {past.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <h2 className="text-base font-semibold">Past plans</h2>
            <p className="text-xs text-muted-foreground">Went? Review it. Didn&apos;t? We won&apos;t tell.</p>
          </div>
          <ul className="divide-y">
            {past.map((p) => (
              <li key={p.id}>
                <Link href={`/events/${p.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{p.title}</span>
                    <span className="text-xs text-muted-foreground">{when(p.starts_at)}</span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-primary">Review →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function PlansSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-[320px] animate-pulse rounded-lg border bg-card" />
      <div className="h-[160px] animate-pulse rounded-lg border bg-card" />
    </div>
  );
}
