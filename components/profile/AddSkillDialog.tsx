"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { addSkill } from "@/app/actions";
import { PRESET_SKILLS, MAX_SKILL_LENGTH } from "@/lib/skills";

type Props = {
  existing: string[]; // names of skills the user already has (to hide/block duplicates)
};

export default function AddSkillDialog({ existing }: Props) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null); // which skill is being saved right now
  const [, startTransition] = useTransition();

  // Case-insensitive set of skills you already have
  const have = new Set(existing.map((s) => s.toLowerCase()));
  const presets = PRESET_SKILLS.filter((s) => !have.has(s.toLowerCase()));

  function add(name: string) {
    const clean = name.trim();
    setError(null);

    // Check in the browser first, so the user gets instant feedback
    if (clean.length < 2) return setError("Too short. Even bad habits need a name.");
    if (clean.length > MAX_SKILL_LENGTH) return setError(`Keep it under ${MAX_SKILL_LENGTH} characters.`);
    if (have.has(clean.toLowerCase())) return setError("You already have that one. Impressive commitment.");

    setAdding(clean);
    startTransition(async () => {
      try {
        await addSkill(clean); // Person 2's server action; the profile refreshes by itself
        if (clean === custom.trim()) setCustom("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't add that skill.");
      } finally {
        setAdding(null);
      }
    });
  }

  function close() {
    setOpen(false);
    setCustom("");
    setError(null);
  }

  return (
    <>
      {/* The "+" in the Skills header */}
      <button
        onClick={() => setOpen(true)}
        className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label="Add skill"
      >
        <Plus className="h-6 w-6" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[10vh]"
          onClick={close}
        >
          <div
            className="w-full max-w-[552px] rounded-lg bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-semibold">Add skills</h2>
              <button onClick={close} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                ✕
              </button>
            </div>

            <div className="space-y-5 px-6 py-4">
              {/* Preset chips */}
              <div>
                <p className="mb-2 text-sm font-semibold">Popular bad habits</p>
                {presets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">You&apos;ve collected them all. 🏆</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {presets.map((name) => (
                      <button
                        key={name}
                        onClick={() => add(name)}
                        disabled={adding !== null}
                        className="rounded-full border border-[#666] px-3 py-1 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                      >
                        {adding === name ? "Adding…" : `+ ${name}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom skill */}
              <form
                onSubmit={(e) => {
                  e.preventDefault(); // stop the browser from reloading the page
                  add(custom);
                }}
              >
                <p className="mb-2 text-sm font-semibold">Or write your own</p>
                <div className="flex gap-2">
                  <input
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    placeholder="e.g. Microwaving fish in the library"
                    maxLength={MAX_SKILL_LENGTH + 10}
                    className="flex-1 rounded border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="submit"
                    disabled={adding !== null || custom.trim().length === 0}
                    className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-[var(--brand-dark)] disabled:bg-muted disabled:text-muted-foreground"
                  >
                    {adding !== null && adding === custom.trim() ? "Adding…" : "Add"}
                  </button>
                </div>
                <p
                  className={`mt-1 text-right text-xs ${
                    custom.length > MAX_SKILL_LENGTH ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {custom.length}/{MAX_SKILL_LENGTH}
                </p>
              </form>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t px-6 py-3">
              <button
                onClick={close}
                className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-[var(--brand-dark)]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}