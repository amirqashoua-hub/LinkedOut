"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { reviewEvent, deleteReview } from "@/app/actions";
import { REVIEW_CATEGORIES, type CategoryRatings } from "@/lib/reviews";

const LABELS = ["", "Never again", "Regrettable", "Mid", "Would regret again", "Life-changing (blacked out)"];
const MAX = 500;

type Props = {
  eventId: string;
  existing: ({ rating: number; body: string | null } & CategoryRatings) | null; // my review, if I already wrote one
};

export default function ReviewForm({ eventId, existing }: Props) {
  const [editing, setEditing] = useState(!existing);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState(existing?.body ?? "");
  const [sub, setSub] = useState<CategoryRatings>(() =>
    Object.fromEntries(REVIEW_CATEGORIES.map(({ key }) => [key, existing?.[key] ?? null]))
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Already reviewed: just offer to edit or delete it
  if (!editing && existing) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>You reviewed this event.</span>
        <button onClick={() => setEditing(true)} className="font-semibold text-primary hover:underline">
          Edit
        </button>
        <span>·</span>
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await deleteReview(eventId);
              if (res.error) setError(res.error);
            })
          }
          className="font-semibold text-primary hover:underline disabled:opacity-50"
        >
          Delete
        </button>
        {error && <span className="text-destructive">{error}</span>}
      </div>
    );
  }

  function submit() {
    setError(null);
    if (rating === 0) return setError("Pick a star rating first.");
    startTransition(async () => {
      const res = await reviewEvent(eventId, rating, body, sub);
      if (res.error) setError(res.error);
      else setEditing(false);
    });
  }

  const shown = hover || rating;

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 text-sm font-semibold">Rate your experience</p>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
            >
              <Star
                className={`h-7 w-7 ${n <= shown ? "fill-[#E7A33E] text-[#E7A33E]" : "text-muted-foreground/50"}`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">{LABELS[shown]}</span>
        </div>
      </div>

      {/* Optional sub-ratings (click a star again to clear it) */}
      <div>
        <p className="mb-1 text-sm font-semibold">
          Break it down <span className="font-normal text-muted-foreground">(optional)</span>
        </p>
        <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
          {REVIEW_CATEGORIES.map((c) => (
            <div key={c.key} className="flex items-center justify-between gap-2">
              <span className="text-sm" title={"hint" in c ? c.hint : undefined}>
                {c.label}
                {"hint" in c && <span className="ml-1 text-xs text-muted-foreground">({c.hint})</span>}
              </span>
              <span className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSub({ ...sub, [c.key]: sub[c.key] === n ? null : n })}
                    aria-label={`${c.label}: ${n} star${n > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`h-5 w-5 ${n <= (sub[c.key] ?? 0) ? "fill-[#E7A33E] text-[#E7A33E]" : "text-muted-foreground/40"}`}
                    />
                  </button>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="How was it? Be honest, future attendees are counting on you."
          rows={3}
          maxLength={MAX}
          className="w-full resize-none rounded border p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-right text-xs text-muted-foreground">
          {body.length}/{MAX}
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2">
        {existing && (
          <button
            onClick={() => setEditing(false)}
            className="rounded-full px-4 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-accent"
          >
            Cancel
          </button>
        )}
        <button
          onClick={submit}
          disabled={pending}
          className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-[var(--brand-dark)] disabled:opacity-50"
        >
          {pending ? "Posting…" : existing ? "Update review" : "Post review"}
        </button>
      </div>
    </div>
  );
}
