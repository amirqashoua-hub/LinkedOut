"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { addWorstClass, removeWorstClass } from "@/app/actions";

// The "+" in the Worst Classes header: opens a small dialog to add a class + grade
export function AddWorstClassButton() {
  const [open, setOpen] = useState(false);
  const [course, setCourse] = useState("");
  const [grade, setGrade] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setCourse("");
    setGrade("");
    setError(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault(); // stop the browser from reloading the page
    setError(null);
    if (course.trim().length < 2) return setError("Which class ruined you?");
    startTransition(async () => {
      const res = await addWorstClass(course, grade);
      if (res.error) setError(res.error);
      else close(); // the profile refreshes by itself
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label="Add worst class"
      >
        <Plus className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[10vh]" onClick={close}>
          <form
            onSubmit={submit}
            className="w-full max-w-[552px] rounded-lg bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-semibold">Add a worst class</h2>
              <button type="button" onClick={close} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                ✕
              </button>
            </div>

            <div className="space-y-4 px-6 py-4">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">Class</span>
                <input
                  autoFocus
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  maxLength={80}
                  placeholder="e.g. MATH 240: the proofs proved me wrong"
                  className="w-full rounded border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">Grade</span>
                <input
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  maxLength={30}
                  placeholder="e.g. D+ (or 'Don't ask')"
                  className="w-full rounded border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="flex justify-end gap-2 border-t px-6 py-3">
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-[var(--brand-dark)] disabled:opacity-50"
              >
                {pending ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

// Trash icon on each class (your own profile only)
export function RemoveWorstClassButton({ id, course }: { id: string; course: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="ml-auto flex flex-col items-end">
      <button
        onClick={() => {
          if (!window.confirm(`Remove "${course}" from your worst classes?`)) return;
          setError(null);
          startTransition(async () => {
            const res = await removeWorstClass(id);
            if (res.error) setError(res.error);
          });
        }}
        disabled={pending}
        title="Remove class"
        aria-label={`Remove ${course}`}
        className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-destructive disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
