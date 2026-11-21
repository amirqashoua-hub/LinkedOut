"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { endorse } from "@/app/actions";

type Props = {
  skillId: string;
  alreadyEndorsed: boolean; // from Person 2's endorsedByMe once available, else false
  ownerFirstName: string; // for the error message
};

export default function EndorseButton({ skillId, alreadyEndorsed, ownerFirstName }: Props) {
  const [endorsed, setEndorsed] = useState(alreadyEndorsed);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (endorsed) return; // un-endorsing needs an unendorse() action from Person 2
    setError(null);
    setEndorsed(true); // optimistic: show "Endorsed" immediately
    startTransition(async () => {
      try {
        await endorse(skillId); // Person 2's server action; counts refresh by themselves
      } catch {
        setEndorsed(false); // roll back
        setError(`Only ${ownerFirstName}'s enablers can endorse. Connect first.`);
      }
    });
  }

  return (
    <div className="mt-2">
      <button
        onClick={handleClick}
        disabled={pending || endorsed}
        className={
          endorsed
            ? "flex items-center gap-1 rounded-full border border-[#666] px-4 py-1 text-sm font-semibold text-muted-foreground"
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