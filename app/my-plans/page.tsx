import { Suspense } from "react";
import Link from "next/link";
import { getMyPlans } from "@/lib/social";
import CancelPlan from "@/components/CancelPlan";

function when(iso: string | null) {
  if (!iso) return "Date TBD";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Montreal",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

async function Plans() {
  const { loggedIn, plans } = await getMyPlans();
  if (!loggedIn) {
    return <p className="text-sm text-muted-foreground">Sign in to see your plans.</p>;
  }
  if (plans.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No plans yet. Tap <span className="font-semibold">I&apos;m going</span> on the{" "}
        <Link href="/events" className="text-primary hover:underline">
          Events
        </Link>{" "}
        page.
      </p>
    );
  }
  const now = Date.now();
  const upcoming = plans.filter((p) => p.starts_at && new Date(p.starts_at).getTime() > now);
  const past = plans.filter((p) => !p.starts_at || new Date(p.starts_at).getTime() <= now);

  const row = (p: (typeof plans)[number], canCancel: boolean) => (
    <li key={p.id} className="flex items-start justify-between gap-3 rounded-lg border bg-card p-4">
      <div className="min-w-0">
        <p className="font-semibold text-primary">{p.title}</p>
        <p className="text-sm">{p.org}</p>
        <p className="text-sm text-muted-foreground">
          {p.location ?? "Location TBD"} · {when(p.starts_at)}
        </p>
        {p.source === "evelya" && p.source_url?.startsWith("https://") && (
          <a
            href={p.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-sm font-semibold text-gray-700 hover:underline"
          >
            Tickets on Evelya ↗
          </a>
        )}
      </div>
      {canCancel && <CancelPlan eventId={p.id} />}
    </li>
  );

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Coming up</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing coming up.</p>
        ) : (
          <ul className="space-y-3">{upcoming.map((p) => row(p, true))}</ul>
        )}
      </section>
      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Past</h2>
          <ul className="space-y-3">{past.map((p) => row(p, false))}</ul>
        </section>
      )}
    </div>
  );
}

export default function MyPlansPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <h1 className="text-xl font-semibold">My plans</h1>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <Plans />
      </Suspense>
    </div>
  );
}