import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Users, UserRoundPlus, CalendarDays, BookOpen } from "lucide-react";
import Avatar from "@/components/Avatar";
import ConnectButton from "@/components/ConnectButton";
import RightSidebar from "@/components/RightSidebar";
import { getCurrentUser, getPeopleYouMayKnow, getGuiltTrips } from "@/lib/data";

export const metadata: Metadata = { title: "My Enablers" };

const MANAGE = [
  { icon: Users, label: "Enablers", href: "/network" },
  { icon: UserRoundPlus, label: "Following", href: "/network" },
  { icon: BookOpen, label: "Study groups you skipped", href: "/network" },
  { icon: CalendarDays, label: "Events", href: "/events" },
];

// Same 3-column grid as Home and Events. Data loads inside <Suspense>.
export default function NetworkPage() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[225px_minmax(0,1fr)] lg:grid-cols-[225px_minmax(0,1fr)_300px]">
      {/* Left: "Manage my network" menu */}
      <aside className="hidden md:block">
        <nav className="rounded-lg border bg-card">
          <h2 className="border-b px-4 py-3 text-base font-semibold">Manage my network</h2>
          <div className="py-2">
            {MANAGE.map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </aside>

      <section className="space-y-2">
        <Suspense fallback={<LoadingCard text="Finding bad influences…" />}>
          <NetworkContent />
        </Suspense>
      </section>

      <RightSidebar />
    </div>
  );
}

// ----- Person 2's data logic below is unchanged; only the markup/styling changed -----

async function NetworkContent() {
  const me = await getCurrentUser();
  if (!me) {
    return (
      <section className="rounded-lg border bg-card p-6 text-center">
        <p className="font-semibold">Sign in to find your enablers</p>
        <p className="text-sm text-muted-foreground">We match you with people who share your worst habits.</p>
      </section>
    );
  }

  const [{ items }, people] = await Promise.all([getGuiltTrips(), getPeopleYouMayKnow(8)]);
  const invitations = items.filter((i) => i.kind === "connection_request");

  return (
    <>
      {/* Invitations */}
      <section className="rounded-lg border bg-card">
        <h2 className="border-b px-4 py-3 text-base font-semibold">
          {invitations.length > 0 ? `Invitations (${invitations.length})` : "No pending invitations"}
        </h2>
        {invitations.length > 0 && (
          <ul className="divide-y">
            {invitations.map((inv) => (
              <li key={inv.actor_id} className="flex items-center gap-3 px-4 py-3">
                <Link href={`/in/${inv.actor_handle}`}>
                  <Avatar name={inv.actor_name} url={inv.actor_avatar} size={56} />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/in/${inv.actor_handle}`}
                    className="text-sm font-semibold hover:text-primary hover:underline"
                  >
                    {inv.actor_name}
                  </Link>
                  <p className="text-xs text-muted-foreground">wants to be a bad influence on you</p>
                </div>
                <ConnectButton userId={inv.actor_id!} mode="accept" />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* People you may know: LinkedIn-style cards with a banner and overlapping avatar */}
      <section className="rounded-lg border bg-card p-4">
        <h2 className="text-base font-semibold">People you may know</h2>
        <p className="mb-4 text-xs text-muted-foreground">Based on your shared bad habits</p>

        {people.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No matches yet. Log a few more nights out to find your people.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {people.map((p) => (
              <div key={p.id} className="flex flex-col overflow-hidden rounded-lg border text-center">
                <div className="h-14 bg-linear-to-r from-[var(--banner-from)] to-[var(--banner-to)]" />
                <div className="flex flex-1 flex-col items-center px-3 pb-3">
                  <Link href={`/in/${p.handle}`} className="-mt-9 rounded-full border-2 border-white">
                    <Avatar name={p.full_name} url={p.avatar_url} size={72} />
                  </Link>
                  <Link
                    href={`/in/${p.handle}`}
                    className="mt-2 text-sm font-semibold hover:text-primary hover:underline"
                  >
                    {p.full_name}
                  </Link>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{p.headline}</p>
                  <p className="mt-2 text-xs">
                    Both regulars at <span className="font-semibold">{p.top_place}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You: {p.my_count} · Them: {p.their_count} visits
                  </p>
                  <p className="mb-3 text-xs text-muted-foreground">
                    {p.shared_places} shared hangout{p.shared_places === 1 ? "" : "s"}
                  </p>
                  <div className="mt-auto">
                    <ConnectButton userId={p.id!} mode="connect" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function LoadingCard({ text }: { text: string }) {
  return (
    <section className="animate-pulse rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
      {text}
    </section>
  );
}