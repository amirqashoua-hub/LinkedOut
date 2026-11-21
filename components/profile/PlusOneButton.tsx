"use client";

import { useState, useTransition } from "react";
import { logVisit } from "@/app/actions";

type Props = { placeId: string; placeName: string; firstName: string };

export default function PlusOneButton({ placeId, placeName, firstName }: Props) {
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ big: boolean; text: string } | null>(null);

  function show(big: boolean, text: string) {
    setToast({ big, text });
    setTimeout(() => setToast(null), 5000); // auto-hide after 5s
  }

  function handleClick() {
    startTransition(async () => {
      try {
        const res = await logVisit(placeId);
        if (res.promoted) {
          show(true, `🎉 ${firstName} started a new position as ${res.title} at ${placeName}`);
        } else {
          show(false, `Visit logged. ${res.count} visits at ${placeName}.`);
        }
      } catch (e) {
        show(false, `❌ ${e instanceof Error ? e.message : "Something went wrong"}`);
      }
    });
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={pending}
        className="rounded-full border border-primary px-3 py-1 text-sm font-semibold text-primary hover:bg-[#EBF4FD] disabled:opacity-50"
      >
        {pending ? "…" : "+1"}
      </button>

      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 left-6 z-50 flex max-w-sm items-start gap-3 rounded-lg border bg-card p-4 text-sm shadow-lg ${
            toast.big ? "border-l-4 border-l-[var(--success)] font-semibold" : ""
          }`}
        >
          <span className="flex-1">{toast.text}</span>
          <button onClick={() => setToast(null)} className="text-muted-foreground hover:text-foreground" aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}
    </>
  );
}