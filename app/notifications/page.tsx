import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import ConnectButton from "@/components/ConnectButton";
import MarkGuiltTripsSeen from "@/components/MarkGuiltTripsSeen";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { REACTIONS } from "@/lib/reactions";
import { timeAgo } from "@/lib/format";
import { getCurrentUser, getGuiltTrips } from "@/lib/data";

export const metadata: Metadata = { title: "Guilt Trips" };

type GuiltTrip = Awaited<ReturnType<typeof getGuiltTrips>>["items"][number];

// Same 3-column grid as Home: your profile card on the left, like LinkedIn's notifications page
export default function NotificationsPage() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[225px_minmax(0,1fr)] lg:grid-cols-[225px_minmax(0,1fr)_300px]">
      <LeftSidebar />

      <section className="space-y-2">
        <Suspense
          fallback={
            <section className="animate-pulse rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
              Loading your guilt trips…
            </section>
          }
        >
          <NotificationsContent />
        </Suspense>
      </section>

      <RightSidebar />
    </div>
  );
}

// ----- Person 2's data logic below is unchanged; only the markup/styling changed -----

async function NotificationsContent() {
  const me = await getCurrentUser();
  if (!me) {
    return (
      <section className="rounded-lg border bg-card p-6 text-center">
        <p className="font-semibold">Sign in to see who is judging you</p>
      </section>
    );
  }

  const { items, judgedThisWeek } = await getGuiltTrips();

  return (
    <>
      {/* opening this page clears the red badge on the Guilt Trips tab */}
      <MarkGuiltTripsSeen />
      {/* Profile views banner */}
      <section className="flex items-center gap-3 rounded-lg border bg-card p-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-tint text-2xl">
          👀
        </span>
        <div>
          <p className="text-sm font-semibold">
            {judgedThisWeek} {judgedThisWeek === 1 ? "person" : "people"} judged your profile this week
          </p>
          <Link href={`/in/${me.handle}`} className="text-sm font-semibold text-primary hover:underline">
            See what they saw →
          </Link>
        </div>
      </section>

      {/* Notification list */}
      <section className="rounded-lg border bg-card">
        <h1 className="border-b px-4 py-3 text-base font-semibold">Guilt Trips</h1>
        {items.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No guilt trips yet. Post a fuck-up to get some.
          </p>
        ) : (
          <ul className="divide-y">
            {items.map((t, i) => (
              <li
                key={`${t.kind}-${t.actor_id}-${t.created_at}-${i}`}
                // Recent ones (first 3) get LinkedIn's light-blue "unread" background
                className={`flex items-start gap-3 px-4 py-3 hover:bg-accent ${i < 3 ? "bg-brand-tint" : ""}`}
              >
                {/* Blue unread dot */}
                <span
                  className={`mt-5 h-2 w-2 shrink-0 rounded-full ${i < 3 ? "bg-primary" : "bg-transparent"}`}
                />
                <Link href={`/in/${t.actor_handle}`}>
                  <Avatar name={t.actor_name} url={t.actor_avatar} size={48} />
                </Link>
                <div className="min-w-0 flex-1 text-sm">
                  <p>
                    <Link href={`/in/${t.actor_handle}`} className="font-semibold hover:underline">
                      {t.actor_name}
                    </Link>{" "}
                    {describe(t)}
                  </p>
                  <p className="text-xs text-muted-foreground">{timeAgo(t.created_at)}</p>
                </div>
                {t.kind === "connection_request" && <ConnectButton userId={t.actor_id!} mode="accept" />}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function describe(t: GuiltTrip) {
  switch (t.kind) {
    case "endorsement":
      return (
        <>
          endorsed you for <strong>{t.detail}</strong>
        </>
      );
    case "reaction": {
      const r = REACTIONS.find((r) => r.key === t.detail);
      return (
        <>
          reacted {r?.emoji} <strong>{r?.label ?? t.detail}</strong> to your post
        </>
      );
    }
    case "connection_request":
      return <>wants to be a bad influence on you</>;
    case "friends_going": {
      // "and 2 other enablers are going to BDBAND. Peer pressure: activated."
      const others = (t.friend_names?.length ?? 1) - 1;
      return (
        <>
          and {others} other {others === 1 ? "enabler" : "enablers"} are going to{" "}
          <Link href={`/events/${t.event_id}`} className="font-semibold text-primary hover:underline">
            {t.detail}
          </Link>
          . Peer pressure: activated.
        </>
      );
    }
    default:
      return null;
  }
}