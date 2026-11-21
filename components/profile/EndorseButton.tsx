"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { endorse, unendorse } from "@/app/actions";

type Props = {
  skillId: string;
  alreadyEndorsed: boolean; // from getProfile's endorsedByMe
  ownerFirstName: string; // for the fallback error message
};

export default function EndorseButton({ skillId, alreadyEndorsed, ownerFirstName }: Props) {
  const [endorsed, setEndorsed] = useState(alreadyEndorsed);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Toggle: Endorse ↔ ✓ Endorsed
  function handleClick() {
    const next = !endorsed;
    setError(null);
    setEndorsed(next); // optimistic: flip immediately

    startTransition(async () => {
      try {
        // Both actions return { error } instead of throwing (so messages survive production)
        const res = next ? await endorse(skillId) : await unendorse(skillId);
        if (res.error) {
          setEndorsed(!next); // roll back
          setError(res.error);
        }
      } catch {
        setEndorsed(!next); // roll back (network / unexpected failure)
        setError(`Couldn't update your endorsement of ${ownerFirstName}. Try again.`);
      }
    });
  }

  return (
    <div className="mt-2">
      <button
        onClick={handleClick}
        disabled={pending}
        title={endorsed ? "Click to remove your endorsement" : undefined}
        className={
          endorsed
            ? "flex items-center gap-1 rounded-full border border-[#666] px-4 py-1 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
            : "rounded-full border border-[#666] px-4 py-1 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
        }
      >
        {endorsed ? (
          <>
            <Check className="h-4 w-4" /> Endorsed
          </>
        ) : (
          "Endorse"
        )}
      </button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}