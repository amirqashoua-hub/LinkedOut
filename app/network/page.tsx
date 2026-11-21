import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { Users, UserRoundPlus, Clock, CalendarDays } from "lucide-react";
import Avatar from "@/components/Avatar";
import ConnectButton from "@/components/ConnectButton";
import RightSidebar from "@/components/RightSidebar";
import {
  getCurrentUser,
  getPeopleYouMayKnow,
  getGuiltTrips,
  getMyNetwork,
  type NetworkPerson,
} from "@/lib/data";

export const metadata: Metadata = { title: "My Enablers" };

// Which list is shown: /network (suggestions), /network?view=enablers, /network?view=pending
type View = "suggestions" | "enablers" | "pending";
type SearchParams = Promise<{ view?: string }>;
const toView = (v?: string): View => (v === "enablers" || v === "pending" ? v : "suggestions");

// Same 3-column grid as Home and Events. The menu and the list depend on the URL and
// who's signed in, so both load inside <Suspense>.
export default function NetworkPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[225px_minmax(0,1fr)] lg:grid-cols-[225px_minmax(0,1fr)_300px]">
      <aside className="hidden md:block">
        <Suspense fallback={<NetworkMenu view={null} counts={null} />}>
          <NetworkMenuLoader searchParams={searchParams} />
        </Suspense>
      </aside>

      <section className="space-y-2">
        <Suspense fallback={<LoadingCard text="Finding bad influences…" />}>
          <NetworkContent searchParams={searchParams} />
        </Suspense>
      </section>

      <RightSidebar />
    </div>
  );
}

// ---------- Left menu ----------

async function NetworkMenuLoader({ searchParams }: { searchParams: SearchParams }) {
  const [{ view }, network] = await Promise.all([searchParams, getMyNetwork()]);
  const counts = network
    ? { enablers: network.enablers.length, pending: network.incoming.length + network.outgoing.length }
    : null;
  return <NetworkMenu view={toView(view)} counts={counts} />;
}

function NetworkMenu({
  view,
  counts,
}: {
  view: View | null;
  counts: { enablers: number; pending: number } | null;
}) {
  const items = [
    { key: "suggestions", icon: UserRoundPlus, label: "People you may know", href: "/network", count: null },
    { key: "enablers", icon: Users, label: "Enablers", href: "/network?view=enablers", count: counts?.enablers },
    { key: "pending", icon: Clock, label: "Pending", href: "/network?view=pending", count: counts?.pending },
    { key: "events", icon: CalendarDays, label: "Events", href: "/events", count: null },
  ];

  return (
    <nav className="rounded-lg border bg-card">
      <h2 className="border-b px-4 py-3 text-base font-semibold">Manage my network</h2>
      <div className="py-2">
        {items.map(({ key, icon: Icon, label, href, count }) => {
          const active = view === key;
          return (
            <Link
              key={key}
              href={href}
              className={`flex items-center gap-3 border-l-2 px-4 py-2 text-sm font-semibold hover:bg-accent hover:text-foreground ${
                active ? "border-l-primary bg-brand-tint text-foreground" : "border-l-transparent text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1">{label}</span>
              {typeof count === "number" && <span className="text-xs">{count}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ---------- Main column ----------

async function NetworkContent({ searchParams }: { searchParams: SearchParams }) {
  const [{ view }, me] = await Promise.all([searchParams, getCurrentUser()]);
  if (!me) {
    return (
      <section className="rounded-lg border bg-card p-6 text-center">
        <p className="font-semibold">Sign in to find your enablers</p>
        <p className="text-sm text-muted-foreground">We match you with people who share your worst habits.</p>
      </section>
    );
  }

  const current = toView(view);
  if (current === "enablers") return <EnablersList />;
  if (current === "pending") return <PendingList />;
  return <Suggestions />;
}

// Everyone you're connected with
async function EnablersList() {
  const network = await getMyNetwork();
  const enablers = network?.enablers ?? [];

  return (
    <section className="rounded-lg border bg-card">
      <h1 className="border-b px-4 py-3 text-base font-semibold">Your enablers ({enablers.length})</h1>
      {enablers.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">
          No enablers yet. Find some in{" "}
          <Link href="/network" className="font-semibold text-primary hover:underline">
            People you may know
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y">
          {enablers.map((p) => (
            <PersonRow key={p.id} person={p}>
              <Link
                href={`/in/${p.handle}`}
                className="rounded-full border border-primary px-4 py-1 text-sm font-semibold text-primary hover:bg-brand-tint"
              >
                View profile
              </Link>
            </PersonRow>
          ))}
        </ul>
      )}
    </section>
  );
}

// Requests to you (accept them) and requests you sent (waiting)
async function PendingList() {
  const network = await getMyNetwork();
  const incoming = network?.incoming ?? [];
  const outgoing = network?.outgoing ?? [];

  return (
    <>
      <section className="rounded-lg border bg-card">
        <h1 className="border-b px-4 py-3 text-base font-semibold">Requests to you ({incoming.length})</h1>
        {incoming.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">Nobody wants to be a bad influence on you. Yet.</p>
        ) : (
          <ul className="divide-y">
            {incoming.map((p) => (
              <PersonRow key={p.id} person={p} note="wants to be a bad influence on you">
                <ConnectButton userId={p.id} mode="accept" />
              </PersonRow>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border bg-card">
        <h2 className="border-b px-4 py-3 text-base font-semibold">Sent by you ({outgoing.length})</h2>
        {outgoing.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">No requests waiting on anyone.</p>
        ) : (
          <ul className="divide-y">
            {outgoing.map((p) => (
              <PersonRow key={p.id} person={p} note="hasn't accepted yet. Give them time.">
                <span className="flex items-center gap-1 rounded-full bg-muted px-4 py-1 text-sm font-semibold text-muted-foreground">
                  <Clock className="h-4 w-4" /> Pending
                </span>
              </PersonRow>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

// One person: avatar, name, headline (or a note), and an action on the right
function PersonRow({ person, note, children }: { person: NetworkPerson; note?: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Link href={`/in/${person.handle}`}>
        <Avatar name={person.full_name} url={person.avatar_url} size={56} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/in/${person.handle}`} className="text-sm font-semibold hover:text-primary hover:underline">
          {person.full_name}
        </Link>
        <p className="truncate text-xs text-muted-foreground">{note ?? person.headline}</p>
      </div>
      {children}
    </li>
  );
}

// ----- Default view: Person 2's invitations + People you may know (logic unchanged) -----

async function Suggestions() {
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
