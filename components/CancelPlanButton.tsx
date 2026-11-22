"use client";

import { useState, useTransition } from "react";
import { cancelRsvp } from "@/app/actions";

// "Cancel plans" on My plans: removes your RSVP (the list refreshes without it)
export default function CancelPlanButton({ eventId, title }: { eventId: string; title: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button
        onClick={() => {
          if (!window.confirm(`Cancel your plans for ${title}? Your enablers will be disappointed.`)) return;
          setError(null);
          startTransition(async () => {
            try {
              await cancelRsvp(eventId);
            } catch {
              setError("Couldn't cancel. Are you signed in?");
            }
          });
        }}
        disabled={pending}
        className="mt-3 inline-block rounded-full border border-[#666] px-4 py-1 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-destructive disabled:opacity-50"
      >
        {pending ? "Cancelling…" : "Cancel plans"}
      </button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </>
  );
}
