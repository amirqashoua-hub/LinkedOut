"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { rsvp, cancelRsvp } from "@/app/actions";

// "RSVP" on a Promoted ad → "✓ I'm going": a real RSVP to the ad's event (shows up in My plans)
export default function AdGoingButton({ eventId, initialGoing }: { eventId: string; initialGoing: boolean }) {
  const [going, setGoing] = useState(initialGoing);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !going;
    setGoing(next); // optimistic
    setError(null);
    startTransition(async () => {
      try {
        await (next ? rsvp(eventId) : cancelRsvp(eventId));
      } catch {
        setGoing(!next); // roll back (e.g. not signed in)
        setError("Sign in to RSVP.");
      }
    });
  }

  return (
    <>
      <button
        onClick={toggle}
        disabled={pending}
        title={going ? "Click to cancel" : undefined}
        className={
          going
            ? "mt-2 flex w-full items-center justify-center gap-1 rounded-full border border-primary bg-brand-tint py-1 text-sm font-semibold text-primary disabled:opacity-50"
            : "mt-2 block w-full rounded-full bg-primary py-1 text-center text-sm font-semibold text-primary-foreground hover:bg-brand-dark disabled:opacity-50"
        }
      >
        {going ? (
          <>
            <Check className="h-4 w-4" /> I&apos;m going
          </>
        ) : (
          "RSVP"
        )}
      </button>
      {error && <p className="text-destructive">{error}</p>}
    </>
  );
}
