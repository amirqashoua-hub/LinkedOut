import Link from "next/link";
import { getGoingTo } from "@/lib/social";

export default async function GoingTo({ userId }: { userId: string }) {
  const events = await getGoingTo(userId).catch(() => []);
  if (events.length === 0) return null;
  return (
    <section className="rounded-lg border bg-card p-4">
      <h2 className="text-base font-semibold">Going to</h2>
      <ul className="mt-2 space-y-2">
        {events.map((e) => (
          <li key={e.id} className="text-sm">
            <Link href="/events" className="font-semibold text-primary hover:underline">
              {e.title}
            </Link>
            <span className="text-muted-foreground">
              {" · "}
              {e.org}
              {" · "}
              {new Intl.DateTimeFormat("en-US", {
                timeZone: "America/Montreal",
                month: "short",
                day: "numeric",
              }).format(new Date(e.starts_at!))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}