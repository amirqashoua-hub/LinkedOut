import Link from "next/link";
import { getAuraLeaderboard } from "@/lib/data";
import Avatar from "@/components/Avatar";
import AuraToken from "@/components/AuraToken";

const MEDALS = ["🥇", "🥈", "🥉"];

// Top Aura Points earners (from settled LockedOut Odds), shown under the Odds card
export default async function AuraLeaderboard() {
  const { top, me } = await getAuraLeaderboard(5);
  const meInTop = !!me && top.some((r) => r.id === me.id);

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="px-4 pt-3 pb-1">
        <h2 className="text-base font-semibold">Aura Leaderboard 🏆</h2>
        <p className="text-xs text-muted-foreground">Most Aura Points from settled odds</p>
      </div>

      {top.length === 0 ? (
        <p className="px-4 py-3 text-sm text-muted-foreground">No aura yet. Settle a line to crown someone.</p>
      ) : (
        <ol className="py-1">
          {top.map((r) => {
            const isMe = me?.id === r.id;
            return (
              <li key={r.id}>
                <Link
                  href={`/in/${r.handle}`}
                  className={`flex items-center gap-2 px-4 py-1.5 text-sm hover:bg-accent ${isMe ? "bg-brand-tint" : ""}`}
                >
                  <span className="w-6 shrink-0 text-center text-xs font-semibold text-muted-foreground">
                    {MEDALS[r.rank - 1] ?? `#${r.rank}`}
                  </span>
                  <Avatar name={r.full_name} url={r.avatar_url} size={28} />
                  <span className="min-w-0 flex-1 truncate font-semibold">
                    {r.full_name}
                    {isMe && <span className="ml-1 text-xs font-normal text-muted-foreground">(you)</span>}
                  </span>
                  <span className={`flex shrink-0 items-center gap-1 text-xs font-semibold ${r.aura < 0 ? "text-destructive" : ""}`}>
                    <AuraToken size={14} />
                    {r.aura.toLocaleString("en-US")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}

      {/* Your own standing when you're not in the top 5 */}
      {me && !meInTop && (
        <p className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
          <span>
            You: {me.rank ? `#${me.rank}` : "unranked"}
          </span>
          <span className="flex items-center gap-1 font-semibold text-foreground">
            <AuraToken size={14} />
            {me.aura.toLocaleString("en-US")} AP
          </span>
        </p>
      )}
    </div>
  );
}

export function AuraLeaderboardSkeleton() {
  return <div className="h-[220px] animate-pulse rounded-lg border bg-card" />;
}
