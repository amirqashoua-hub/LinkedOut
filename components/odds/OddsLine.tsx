"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { voteOdds, type OddsPick } from "@/app/actions";
import type { Tables } from "@/lib/database.types";
import Avatar from "@/components/Avatar";

type Line = Tables<"odds_board">;

// Vote share → joke sportsbook odds: favourite is negative (-150), underdog positive (+250)
function americanOdds(share: number | null): string {
  if (share === null) return "EVEN";
  const p = Math.min(0.95, Math.max(0.05, share)); // keep it sane at 0% / 100%
  if (Math.abs(p - 0.5) < 0.001) return "EVEN";
  return p > 0.5 ? `-${Math.round((100 * p) / (1 - p))}` : `+${Math.round((100 * (1 - p)) / p)}`;
}

// "40" + "%" → "40%", "9" + "drinks" → "9 drinks"
function formatLine(line: number | null, unit: string | null) {
  if (line === null) return "";
  return unit ? (unit === "%" ? `${line}%` : `${line} ${unit}`) : String(line);
}

export default function OddsLine({ line }: { line: Line }) {
  const [mine, setMine] = useState<OddsPick | null>((line.my_pick as OddsPick | null) ?? null);
  const [counts, setCounts] = useState({ over: line.over_count ?? 0, under: line.under_count ?? 0 });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const total = counts.over + counts.under;
  const overShare = total === 0 ? null : counts.over / total;
  const firstName = (line.full_name ?? "Someone").split(" ")[0];

  // Click a side to bet it; click your current side again to take the bet back
  function vote(side: OddsPick) {
    if (!line.id) return;
    const next = mine === side ? null : side;
    const prev = { mine, counts };

    // optimistic: move my vote between the two counts
    const updated = { ...counts };
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

  const sides: { side: OddsPick; label: string; count: number; share: number | null }[] = [
    { side: "over", label: "Over", count: counts.over, share: overShare },
    { side: "under", label: "Under", count: counts.under, share: overShare === null ? null : 1 - overShare },
  ];

  return (
    <li className="px-4 py-3">
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
          <p className="text-xs font-semibold text-primary">O/U {formatLine(line.line, line.unit)}</p>
        </div>
      </div>

      {/* Over / Under buttons with the vote split as a bar */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        {sides.map(({ side, label, count, share }) => {
          const picked = mine === side;
          return (
            <button
              key={side}
              onClick={() => vote(side)}
              disabled={pending}
              aria-pressed={picked}
              title={picked ? "Click again to take your bet back" : `Bet ${label.toLowerCase()}`}
              className={`relative overflow-hidden rounded-md border px-2 py-1.5 text-left text-xs font-semibold disabled:opacity-60 ${
                picked ? "border-primary text-primary" : "text-foreground hover:bg-accent"
              }`}
            >
              {/* filled share bar behind the text */}
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
                {share === null ? "No bets yet" : `${Math.round(share * 100)}% · ${count}`}
              </span>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </li>
  );
}
