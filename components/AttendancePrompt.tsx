"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { markAttended, markNotAttended } from "@/app/actions";

type Props = { eventId: string; title: string };

export default function AttendancePrompt({ eventId, title }: Props) {
  const [result, setResult] = useState<{ big: boolean; text: string; attended?: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function yes() {
    setError(null);
    startTransition(async () => {
      try {
        const r = await markAttended(eventId); // Person 2: marks attended + adds/+1s the Experience
        setResult(
          r.promoted
            ? { big: true, text: `🎉 New position: ${r.title}${r.previous_title ? ` (was ${r.previous_title})` : ""}`, attended: true }
            : { big: false, text: `Added to Experience: ${r.title}`, attended: true }
        );
      } catch {
        setError("Couldn't update. Are you signed in?");
      }
    });
  }

  function no() {
    setError(null);
    startTransition(async () => {
      try {
        await markNotAttended(eventId);
        setResult({ big: false, text: "Marked as not attended. Your secret is safe." });
      } catch {
        setError("Couldn't update. Are you signed in?");
      }
    });
  }

  // After answering: a success row (green accent for promotions, like the +1 toast)
  if (result) {
    return (
      <li
        className={`px-4 py-4 text-sm ${
          result.big ? "border-l-4 border-l-[var(--success)] font-semibold" : "text-muted-foreground"
        }`}
      >
        {result.text}
        {result.attended && (
          <Link href={`/events/${eventId}`} className="ml-2 font-semibold text-primary hover:underline">
            Leave a review →
          </Link>
        )}
      </li>
    );
  }

  return (
    <li className="flex gap-3 px-4 py-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-brand-tint text-2xl">🎟️</div>
      <div className="flex-1">
        <p className="text-sm">
          Did you attend <span className="font-semibold">{title}</span>?
        </p>
        <p className="text-xs text-muted-foreground">Add it to your Experience. Your tally depends on it.</p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={yes}
            disabled={pending}
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-brand-dark disabled:opacity-50"
          >
            {pending ? "…" : "Yes, add to Experience"}
          </button>
          <button
            onClick={no}
            disabled={pending}
            className="rounded-full border border-[#666] px-4 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-accent disabled:opacity-50"
          >
            No
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    </li>
  );
}