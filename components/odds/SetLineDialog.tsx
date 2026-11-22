"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { createOddsLine } from "@/app/actions";

// One-click examples that fill the form
const EXAMPLES = [
  { subject: "grade on my MATH 240 final", line: "40", unit: "%" },
  { subject: "drinks at BDA tonight", line: "9", unit: "drinks" },
  { subject: "hours of sleep before my midterm", line: "3.5", unit: "hours" },
  { subject: "lectures I'll attend this week", line: "1.5", unit: "lectures" },
];

export default function SetLineDialog() {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [line, setLine] = useState("");
  const [unit, setUnit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setSubject("");
    setLine("");
    setUnit("");
    setError(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault(); // don't reload the page
    const value = Number(line);
    if (subject.trim().length < 3) return setError("What's the bet on?");
    if (line.trim() === "" || !Number.isFinite(value) || value < 0) return setError("Set a number for the line.");
    setError(null);
    startTransition(async () => {
      try {
        const res = await createOddsLine(subject, value, unit);
        if (res.error) return setError(res.error);
        close(); // the card refreshes with the new line on top
      } catch {
        setError("Couldn't set that line");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-1 border-y py-2.5 text-sm font-semibold text-primary hover:bg-brand-tint"
      >
        <Plus className="h-4 w-4" /> Set a line on yourself
      </button>

      {/* Rendered at the top of the page (portal), not inside the sticky, scrollable sidebar:
          Safari traps fixed overlays inside a scrolling column, which greyed out just the card */}
      {open &&
        createPortal(
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-4 pt-[10vh]" onClick={close}>
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] rounded-lg bg-card shadow-xl"
          >
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-semibold">Set a line 🎲</h2>
              <button type="button" onClick={close} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                ✕
              </button>
            </div>

            <div className="space-y-4 px-6 py-4">
              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">Popular lines</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex.subject}
                      type="button"
                      onClick={() => {
                        setSubject(ex.subject);
                        setLine(ex.line);
                        setUnit(ex.unit);
                      }}
                      className="rounded-full border border-[#666] px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      {ex.subject}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block text-sm">
                <span className="font-semibold">The bet is on my…</span>
                <input
                  autoFocus
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={80}
                  placeholder="e.g. drinks at BDA tonight"
                  className="mt-1 w-full rounded border px-3 py-1.5 outline-none focus:ring-2 focus:ring-ring"
                />
              </label>

              <div className="flex gap-3">
                <label className="block w-1/2 text-sm">
                  <span className="font-semibold">Over/under</span>
                  <input
                    value={line}
                    onChange={(e) => setLine(e.target.value)}
                    inputMode="decimal"
                    placeholder="9"
                    className="mt-1 w-full rounded border px-3 py-1.5 outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="block w-1/2 text-sm">
                  <span className="font-semibold">Unit (optional)</span>
                  <input
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    maxLength={20}
                    placeholder="drinks"
                    className="mt-1 w-full rounded border px-3 py-1.5 outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="flex justify-end gap-2 border-t px-6 py-3">
              <button type="button" onClick={close} className="rounded-full px-4 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-accent">
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-brand-dark disabled:opacity-50"
              >
                {pending ? "Setting…" : "Set line"}
              </button>
            </div>
          </form>
        </div>,
          document.body
        )}
    </>
  );
}
