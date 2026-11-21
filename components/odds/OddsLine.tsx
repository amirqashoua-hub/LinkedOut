"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { voteOdds, settleOddsLine, type OddsPick } from "@/app/actions";
import type { Tables } from "@/lib/database.types";
import { AURA_LOSS, auraPayout } from "@/lib/aura";
import Avatar from "@/components/Avatar";
import AuraToken from "@/components/AuraToken";

type Line = Tables<"odds_board">;

// Vote share → joke sportsbook odds: favourite is negative (-150), underdog positive (+250)
function americanOdds(share: number | null): string {
  if (share === null) return "EVEN";
  const p = Math.min(0.95, Math.max(0.05, share)); // keep it sane at 0% / 100%
  if (Math.abs(p - 0.5) < 0.001) return "EVEN";
  return p > 0.5 ? `-${Math.round((100 * p) / (1 - p))}` : `+${Math.round((100 * (1 - p)) / p)}`;
}

// "40" + "%" → "40%", "9" + "drinks" → "9 drinks"
function formatAmount(n: number | null, unit: string | null) {
  if (n === null) return "";
  return unit ? (unit === "%" ? `${n}%` : `${n} ${unit}`) : String(n);
}

type Props = { line: Line; meId: string | null };

export default function OddsLine({ line, meId }: Props) {
  const [mine, setMine] = useState<OddsPick | null>((line.my_pick as OddsPick | null) ?? null);
  const [counts, setCounts] = useState({ over: line.over_count ?? 0, under: line.under_count ?? 0 });
  const [error, setError] = useState<string | null>(null);
  const [settling, setSettling] = useState(false); // "End betting" form open
  const [result, setResult] = useState("");
  const [pending, startTransition] = useTransition();

  const isAuthor = !!meId && meId === line.author_id;
  const settled = !!line.settled_at;
  const total = counts.over + counts.under;
  const overShare = total === 0 ? null : counts.over / total;
  const firstName = (line.full_name ?? "Someone").split(" ")[0];

  // Click a side to bet it; click your current side again to take the bet back
  function vote(side: OddsPick) {
    if (!line.id || settled || isAuthor) return;
    if (!meId) return setError("Sign in to place your bet");
    const next = mine === side ? null : side;
    const prev = { mine, counts };

    const updated = { ...counts }; // optimistic: move my vote between the two counts
    if (mine) updated[mine] -= 1;
    if (next) updated[next] += 1;
    setMine(next);
    setCounts(updated);
    setError(null);

    startTransition(async () => {
      try {
        const res = await voteOdds(line.id!, next);
        if (res.error) throw new Error(res.error);
      } catch (e) {
        setMine(prev.mine); // roll back
        setCounts(prev.counts);
        setError(e instanceof Error && e.message ? e.message : "Couldn't place that bet");
      }
    });
  }

  // Setter ends the betting with the real result; payouts happen in the database
  function settle(e: React.FormEvent) {
    e.preventDefault();
    if (!line.id) return;
    const value = Number(result);
    if (result.trim() === "" || !Number.isFinite(value) || value < 0) return setError("Enter what actually happened.");
    if (!window.confirm(`End the betting with a final result of ${formatAmount(value, line.unit)}? This can't be undone.`)) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await settleOddsLine(line.id!, value);
        if (res.error) setError(res.error); // otherwise the card refreshes as settled
        else setSettling(false);
      } catch {
        setError("Couldn't end the betting");
      }
    });
  }

  // ---------- Settled: final result + what you won or lost ----------
  if (settled) {
    const outcome = line.outcome as "over" | "under" | "push" | null;
    const myPayout =
      !mine || outcome === "push"
        ? 0
        : mine === outcome
          ? (mine === "over" ? line.over_payout : line.under_payout) ?? 0
          : -AURA_LOSS;

    return (
      <li className="bg-muted/40 px-4 py-3">
        <Header line={line} firstName={firstName} />
        <p className="mt-2 text-xs">
          <span className="font-semibold">Final: {formatAmount(line.result, line.unit)}</span>
          {" · "}
          {outcome === "push" ? (
            <span className="font-semibold">Push: everyone keeps their aura</span>
          ) : (
            <span className="font-semibold text-primary">{outcome === "over" ? "OVER" : "UNDER"} hits ✅</span>
          )}
        </p>
        {mine && (
          <p className="mt-1 flex items-center gap-1 text-xs">
            <AuraToken size={14} />
            {myPayout > 0 ? (
              <span className="font-semibold text-[var(--success)]">You won +{myPayout} AP</span>
            ) : myPayout < 0 ? (
              <span className="font-semibold text-destructive">You lost {myPayout} AP</span>
            ) : (
              <span className="text-muted-foreground">Push: no change</span>
            )}
          </p>
        )}
        <p className="mt-1 text-[11px] text-muted-foreground">
          {counts.over} over · {counts.under} under · betting closed
        </p>
      </li>
    );
  }

  // ---------- Open line ----------
  const sides: { side: OddsPick; label: string; count: number; other: number; share: number | null }[] = [
    { side: "over", label: "Over", count: counts.over, other: counts.under, share: overShare },
    { side: "under", label: "Under", count: counts.under, other: counts.over, share: overShare === null ? null : 1 - overShare },
  ];

  return (
    <li className="px-4 py-3">
      <Header line={line} firstName={firstName} />

      {/* Over / Under buttons with the vote split as a bar and the AP you'd win */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        {sides.map(({ side, label, count, other, share }) => {
          const picked = mine === side;
          // preview: what a win would pay with your vote on this side
          // (already here: counts include you; switching: you leave the other side)
          const win = picked ? auraPayout(count, other) : auraPayout(count + 1, mine ? other - 1 : other);
          return (
            <button
              key={side}
              onClick={() => vote(side)}
              disabled={pending || isAuthor}
              aria-pressed={picked}
              title={
                isAuthor
                  ? "You can't bet on your own line"
                  : picked
                    ? "Click again to take your bet back"
                    : `Bet ${label.toLowerCase()}: win about +${win} AP, lose ${AURA_LOSS} AP`
              }
              className={`relative overflow-hidden rounded-md border px-2 py-1.5 text-left text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
                picked ? "border-primary text-primary" : "text-foreground hover:bg-accent"
              }`}
            >
              <span
                className={`absolute inset-y-0 left-0 ${picked ? "bg-brand-tint" : "bg-muted"}`}
                style={{ width: `${Math.round((share ?? 0) * 100)}%` }}
              />
              <span className="relative flex items-center justify-between gap-1">
                <span>
                  {picked && "✓ "}
                  {label}
                </span>
                <span className="font-mono">{americanOdds(share)}</span>
              </span>
              <span className="relative block text-[11px] font-normal text-muted-foreground">
                {share === null ? "No bets yet" : `${Math.round(share * 100)}% · ${count}`} · +{win} AP
              </span>
            </button>
          );
        })}
      </div>

      {/* The setter can't bet, but can end the betting */}
      {isAuthor && !settling && (
        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>Your line: no betting on yourself.</span>
          <button
            onClick={() => {
              setSettling(true);
              setError(null);
            }}
            className="rounded-full border border-primary px-3 py-0.5 text-xs font-semibold text-primary hover:bg-brand-tint"
          >
            End betting
          </button>
        </div>
      )}
      {isAuthor && settling && (
        <form onSubmit={settle} className="mt-2 flex items-center gap-2">
          <input
            autoFocus
            value={result}
            onChange={(e) => setResult(e.target.value)}
            inputMode="decimal"
            placeholder={`Actual ${line.unit ?? "result"}`}
            aria-label="What actually happened"
            className="w-full min-w-0 rounded border px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-brand-dark disabled:opacity-50"
          >
            {pending ? "…" : "Settle"}
          </button>
          <button
            type="button"
            onClick={() => setSettling(false)}
            className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
            aria-label="Cancel"
          >
            ✕
          </button>
        </form>
      )}

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </li>
  );
}

// Avatar + "Mazen: drinks at BDA tonight" + "O/U 9 drinks"
function Header({ line, firstName }: { line: Line; firstName: string }) {
  return (
    <div className="flex items-start gap-2">
      <Link href={`/in/${line.handle}`} className="shrink-0">
        <Avatar name={line.full_name} url={line.avatar_url} size={28} />
      </Link>
      <div className="min-w-0 text-sm">
        <p className="leading-snug">
          <Link href={`/in/${line.handle}`} className="font-semibold hover:underline">
            {firstName}
          </Link>
          : {line.subject}
        </p>
        <p className="text-xs font-semibold text-primary">O/U {formatAmount(line.line, line.unit)}</p>
      </div>
    </div>
  );
}
