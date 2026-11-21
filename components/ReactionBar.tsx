"use client";

import { useRef, useState, useTransition } from "react";
import { ThumbsUp, MessageSquare, Repeat2, Send } from "lucide-react";
import { react, unreact } from "@/app/actions";
import { REACTIONS, type ReactionKey, type ReactionCounts } from "@/lib/reactions";

// Look up a reaction's emoji/label by its key
const BY_KEY = Object.fromEntries(REACTIONS.map((r) => [r.key, r])) as Record<
  ReactionKey,
  (typeof REACTIONS)[number]
>;
const DEFAULT_REACTION = REACTIONS[0].key; // what a plain click on "React" adds

const OTHER_ACTIONS = [
  { icon: MessageSquare, label: "Comment" },
  { icon: Repeat2, label: "Repost" },
  { icon: Send, label: "Send" },
];

// Returns new counts after switching from one reaction to another (either can be null)
function withChange(counts: ReactionCounts, from: ReactionKey | null, to: ReactionKey | null): ReactionCounts {
  const next = { ...counts };
  if (from) next[from] = Math.max(0, (next[from] ?? 0) - 1);
  if (to) next[to] = (next[to] ?? 0) + 1;
  return next;
}

type Props = {
  postId: string;
  initialCounts: ReactionCounts; // from the feed view's reaction_counts
  initialMine: ReactionKey | null; // from the feed view's my_reaction
};

export default function ReactionBar({ postId, initialCounts, initialMine }: Props) {
  const [counts, setCounts] = useState(initialCounts);
  const [mine, setMine] = useState(initialMine);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set my reaction to `next` (or remove it with null). Updates the screen first, then the server.
  function choose(next: ReactionKey | null) {
    const prevMine = mine;
    const prevCounts = counts;

    setPickerOpen(false);
    setError(null);
    setMine(next); // optimistic
    setCounts(withChange(counts, mine, next));

    startTransition(async () => {
      try {
        if (next) await react(postId, next);
        else await unreact(postId);
      } catch {
        setMine(prevMine); // roll back
        setCounts(prevCounts);
        setError("Sign in to react.");
      }
    });
  }

  // Hover handling: open right away, close after a short delay so the mouse can reach the picker
  function openPicker() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPickerOpen(true);
  }
  function closePickerSoon() {
    closeTimer.current = setTimeout(() => setPickerOpen(false), 300);
  }

  const total = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);
  const top3 = REACTIONS.filter((r) => (counts[r.key] ?? 0) > 0)
    .sort((a, b) => (counts[b.key] ?? 0) - (counts[a.key] ?? 0))
    .slice(0, 3);
  const current = mine ? BY_KEY[mine] : null;

  return (
    <>
      {/* Summary: top 3 emoji + total */}
      {total > 0 && (
        <div className="mx-4 mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <span className="flex -space-x-1">
            {top3.map((r) => (
              <span key={r.key} title={r.label} className="text-sm">
                {r.emoji}
              </span>
            ))}
          </span>
          <span className="ml-1 cursor-pointer hover:text-primary hover:underline">{total}</span>
        </div>
      )}

      {/* Action buttons */}
      <footer className="mx-4 mt-2 grid grid-cols-4 border-t py-1">
        <div className="relative" onMouseEnter={openPicker} onMouseLeave={closePickerSoon}>
          {/* The emoji picker that pops up on hover */}
          {pickerOpen && (
            <div className="absolute bottom-full left-0 z-10 pb-2">
              <div className="flex gap-1 rounded-full border bg-card px-2 py-1 shadow-lg">
                {REACTIONS.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => choose(r.key)}
                    title={r.label}
                    aria-label={r.label}
                    className="rounded-full p-1 text-2xl transition-transform hover:-translate-y-1 hover:scale-125"
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main button: shows my reaction, or "React" */}
          <button
            onClick={() => choose(mine ? null : DEFAULT_REACTION)}
            className={`flex w-full items-center justify-center gap-1.5 rounded py-3 text-sm font-semibold hover:bg-accent ${
              current ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {current ? (
              <span className="text-lg leading-none">{current.emoji}</span>
            ) : (
              <ThumbsUp className="h-5 w-5" />
            )}
            <span className="hidden sm:inline">{current ? current.label : "React"}</span>
          </button>
        </div>

        {OTHER_ACTIONS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex items-center justify-center gap-1.5 rounded py-3 text-sm font-semibold text-muted-foreground hover:bg-accent"
          >
            <Icon className="h-5 w-5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </footer>

      {error && <p className="px-4 pb-2 text-xs text-destructive">{error}</p>}
    </>
  );
}