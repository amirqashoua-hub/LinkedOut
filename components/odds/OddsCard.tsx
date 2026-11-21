import { getOdds, getCurrentUser } from "@/lib/data";
import OddsLine from "@/components/odds/OddsLine";
import SetLineDialog from "@/components/odds/SetLineDialog";

// Server: loads the newest lines (with the viewer's own picks) for the right sidebar on Home
export default async function OddsCard() {
  const [lines, me] = await Promise.all([getOdds(5), getCurrentUser()]);

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="px-4 pt-3 pb-1">
        <h2 className="text-base font-semibold">LockedOut Odds 🎲</h2>
        <p className="text-xs text-muted-foreground">
          Over/unders on your friends&apos; worst decisions. Win or lose Aura Points.
        </p>
      </div>

      {lines.length === 0 ? (
        <p className="px-4 py-3 text-sm text-muted-foreground">No lines yet. The house is waiting.</p>
      ) : (
        <ul className="divide-y">
          {lines.map((line, i) => (
            <OddsLine key={line.id ?? i} line={line} meId={me?.id ?? null} />
          ))}
        </ul>
      )}

      {me ? (
        <SetLineDialog />
      ) : (
        <p className="border-t px-4 py-2.5 text-center text-xs text-muted-foreground">Sign in to place bets</p>
      )}
    </div>
  );
}

export function OddsCardSkeleton() {
  return <div className="h-[360px] animate-pulse rounded-lg border bg-card" />;
}
