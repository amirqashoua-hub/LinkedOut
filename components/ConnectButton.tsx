"use client";

import { useState, useTransition } from "react";
import { sendConnection, acceptConnection } from "@/app/actions";

type Props = { userId: string; mode: "connect" | "accept" };

export default function ConnectButton({ userId, mode }: Props) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <span className="text-sm font-semibold text-muted-foreground">
        {mode === "connect" ? "Pending" : "Enabler added ✓"}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            try {
              setError(null);
              if (mode === "connect") await sendConnection(userId);
              else await acceptConnection(userId);
              setDone(true);
            } catch {
              setError("Sign in to connect.");
            }
          })
        }
        className="rounded-full border border-primary px-4 py-1 text-sm font-semibold text-primary hover:bg-brand-tint disabled:opacity-50"
      >
        {isPending ? "…" : mode === "connect" ? "+ Connect" : "Accept"}
      </button>
      {error && <span className="text-xs text-[#CB112D]">{error}</span>}
    </div>
  );
}