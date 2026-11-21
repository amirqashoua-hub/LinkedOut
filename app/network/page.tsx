import { Suspense } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import ConnectButton from "@/components/ConnectButton";
import { getCurrentUser, getPeopleYouMayKnow, getGuiltTrips } from "@/lib/data";

export default function NetworkPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 py-6">
      <Suspense fallback={<LoadingCard text="Finding bad influences…" />}>
        <NetworkContent />
      </Suspense>
    </main>
  );
}

async function NetworkContent() {
  const me = await getCurrentUser();
  if (!me) {
    return (
      <section className="rounded-lg border bg-card p-6 text-center">
        <p className="font-semibold">Sign in to find your enablers</p>
        <p className="text-sm text-muted-foreground">
          We match you with people who share your worst habits.
        </p>
      </section>
    );
  }

  const [{ items }, people] = await Promise.all([getGuiltTrips(), getPeopleYouMayKnow(8)]);
  const invitations = items.filter((i) => i.kind === "connection_request");

  return (
    <>
      {invitations.length > 0 && (
        <section className="rounded-lg border bg-card">
          <h2 className="border-b px-4 py-3 font-semibold">Invitations ({invitations.length})</h2>
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
        </section>
      )}

      <section className="rounded-lg border bg-card p-4">
        <h2 className="font-semibold">People you may know</h2>
        <p className="mb-4 text-sm text-muted-foreground">Based on your shared bad habits</p>

        {people.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No matches yet. Log a few more nights out to find your people.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {people.map((p) => (
              <div key={p.id} className="flex flex-col items-center rounded-lg border p-4 text-center">
                <Link href={`/in/${p.handle}`}>
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
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function LoadingCard({ text }: { text: string }) {
  return (
    <section className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
      {text}
    </section>
  );
}