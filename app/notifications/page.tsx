import { Suspense } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import ConnectButton from "@/components/ConnectButton";
import { REACTIONS } from "@/lib/reactions";
import { timeAgo } from "@/lib/format";
import { getCurrentUser, getGuiltTrips } from "@/lib/data";

type GuiltTrip = Awaited<ReturnType<typeof getGuiltTrips>>["items"][number];

export default function NotificationsPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 py-6">
      <Suspense
        fallback={
          <section className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
            Loading your guilt trips…
          </section>
        }
      >
        <NotificationsContent />
      </Suspense>
    </main>
  );
}

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
      <section className="flex items-center gap-3 rounded-lg border bg-card p-4">
        <span className="text-3xl">👀</span>
        <div>
          <p className="font-semibold">
            {judgedThisWeek} {judgedThisWeek === 1 ? "person" : "people"} judged your profile this week
          </p>
          <Link href={`/in/${me.handle}`} className="text-sm text-primary hover:underline">
            See what they saw →
          </Link>
        </div>
      </section>

      <section className="rounded-lg border bg-card">
        {items.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No guilt trips yet. Post a fuck-up to get some.
          </p>
        ) : (
          <ul className="divide-y">
            {items.map((t, i) => (
              <li
                key={`${t.kind}-${t.actor_id}-${t.created_at}-${i}`}
                className="flex items-start gap-3 px-4 py-3"
              >
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
                {t.kind === "connection_request" && (
                  <ConnectButton userId={t.actor_id!} mode="accept" />
                )}
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
      return <>endorsed you for <strong>{t.detail}</strong></>;
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
    default:
      return null;
  }
}