"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { logVisit } from "@/app/actions";

export type AddablePlace = {
  id: string;
  name: string;
  type: "drinking_week" | "bar" | "club";
  logo_url: string | null;
};

const TYPE_LABEL = { drinking_week: "Drinking Week", bar: "Bar", club: "Club" } as const;
const TYPE_COLOR = { drinking_week: "bg-[#E7A33E]", bar: "bg-[#5F9B41]", club: "bg-[#8F5849]" } as const;

// The "+" in the Experience header (your own profile): pick a place you haven't logged yet.
// Logging the first visit adds it to Experience as Intern, with the promotion toast.
export default function AddExperienceButton({ places, firstName }: { places: AddablePlace[]; firstName: string }) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function add(place: AddablePlace) {
    setError(null);
    setAdding(place.id);
    startTransition(async () => {
      try {
        const res = await logVisit(place.id);
        setOpen(false);
        setToast(`🎉 ${firstName} started a new position as ${res.title} at ${place.name}`);
        setTimeout(() => setToast(null), 6000);
      } catch {
        setError("Couldn't add that. Are you signed in?");
      } finally {
        setAdding(null);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label="Add experience"
        title="Add experience"
      >
        <Plus className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[8vh]" onClick={() => setOpen(false)}>
          <div className="flex max-h-[85vh] w-full max-w-[480px] flex-col rounded-lg bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-semibold">Add experience</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <p className="mb-3 text-sm text-muted-foreground">Where did you start your career? Your first visit starts you as Intern.</p>
              {places.length === 0 ? (
                <p className="text-sm text-muted-foreground">You&apos;ve worked everywhere. Impressive. Concerning.</p>
              ) : (
                <ul className="divide-y">
                  {places.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => add(p)}
                        disabled={adding !== null}
                        className="flex w-full items-center gap-3 py-2 text-left hover:bg-accent disabled:opacity-50"
                      >
                        {p.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.logo_url} alt="" className="h-10 w-10 shrink-0 rounded border bg-white object-cover" />
                        ) : (
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded font-bold text-white ${TYPE_COLOR[p.type]}`}>
                            {p.name[0]}
                          </div>
                        )}
                        <span className="flex-1 text-sm">
                          <span className="block font-semibold">{p.name}</span>
                          <span className="text-xs text-muted-foreground">{TYPE_LABEL[p.type]}</span>
                        </span>
                        <span className="text-sm font-semibold text-primary">{adding === p.id ? "Adding…" : "+ Add"}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-6 z-50 flex max-w-sm items-start gap-3 rounded-lg border border-l-4 border-l-[var(--success)] bg-card p-4 text-sm font-semibold shadow-lg"
        >
          <span className="flex-1">{toast}</span>
          <button onClick={() => setToast(null)} className="text-muted-foreground hover:text-foreground" aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}
    </>
  );
}
