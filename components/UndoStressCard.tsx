"use client";

import { useState } from "react";
import { Undo2 } from "lucide-react";

const STRESS = [
  "47 internship applications",
  "Cover letter #12",
  "“I’m humbled to announce…”",
  "Unpaid “opportunities”",
  "Networking coffee chats",
  "Rejection email (automated)",
];

const SWIRL_MS = 1100; // matches the intro-swirl animation
const STAGGER_MS = 90; // each chip leaves a little after the previous one

// Home: "Tired of LinkedIn?" Undo swirls the internship stress away
export default function UndoStressCard() {
  const [phase, setPhase] = useState<"stressed" | "undoing" | "free">("stressed");

  function undo() {
    setPhase("undoing");
    setTimeout(() => setPhase("free"), SWIRL_MS + STAGGER_MS * STRESS.length);
  }

  return (
    <section className="overflow-hidden rounded-lg border bg-card p-4">
      {phase === "free" ? (
        <div className="py-2 text-center">
          <p className="text-base font-semibold">Stress undone ✅</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome to LockedOut, where your failures are the main event.
          </p>
          <button
            onClick={() => setPhase("stressed")}
            className="mt-2 text-xs font-semibold text-muted-foreground hover:text-primary hover:underline"
          >
            Bring it back
          </button>
        </div>
      ) : (
        <>
          <p className="text-base font-semibold">Tired of LinkedIn?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The applications, the cover letters, the &ldquo;excited to share&rdquo;. Press Undo and let all the
            internship stress go.
          </p>

          <ul className="mt-3 flex flex-wrap gap-2">
            {STRESS.map((item, i) => (
              <li
                key={item}
                className={`rounded-full border border-[#0A66C2]/30 bg-[#0A66C2]/5 px-3 py-1 text-xs font-semibold text-[#0A66C2] ${
                  phase === "undoing" ? "swirl-away" : ""
                }`}
                style={phase === "undoing" ? { animationDelay: `${i * STAGGER_MS}ms` } : undefined}
              >
                {item}
              </li>
            ))}
          </ul>

          <button
            onClick={undo}
            disabled={phase === "undoing"}
            className="mt-4 flex items-center gap-2 rounded-full bg-primary px-5 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-brand-dark disabled:opacity-60"
          >
            <Undo2 className="h-4 w-4" />
            Undo
          </button>
        </>
      )}
    </section>
  );
}
