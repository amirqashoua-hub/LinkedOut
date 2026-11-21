"use client";

import { useState, useTransition } from "react";
import { createPost } from "@/app/actions";

// TEMP: set to true to skip the AI and use a fake post (while /api/translate is broken).
// Set back to false before the demo!
const SKIP_AI = false;

const TIMEOUT_MS = 20000; // give up on the AI after 20 seconds

type Stage = "write" | "loading" | "preview";

export default function PostComposer() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("write");
  const [raw, setRaw] = useState(""); // what the user typed
  const [ai, setAi] = useState(""); // the AI version (editable)
  const [error, setError] = useState<string | null>(null);
  const [posting, startPosting] = useTransition();

  const tooShort = raw.trim().length < 3;
  const tooLong = raw.length > 280;

  function close() {
    setOpen(false);
    setStage("write");
    setRaw("");
    setAi("");
    setError(null);
  }

  // Calls Person 3's API route
  async function translate() {
    setError(null);

    if (SKIP_AI) {
      setAi(
        `I'm humbled to announce that I ${raw}. 🙏\n\n3 takeaways:\n1. Sleep is a KPI\n2. Failure is just data\n3. Agree? 👇\n\n#Growth #McGill #LockedOut`
      );
      setStage("preview");
      return;
    }

    setStage("loading");
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: raw }),
        signal: AbortSignal.timeout(TIMEOUT_MS), // never hang forever
      });
      const body = await res.json();
      if (!res.ok) {
        // 422 = rejected by moderation or the 3–280 character check
        setError(body.reason ?? "Couldn't translate that. Try something else.");
        setStage("write");
        return;
      }
      setAi(body.aiText);
      setStage("preview");
    } catch (e) {
      setError(
        e instanceof DOMException && e.name === "TimeoutError"
          ? "The AI is taking too long. Try again."
          : "Network error. Try again."
      );
      setStage("write");
    }
  }

  // Calls Person 2's server action; the feed refreshes by itself afterwards
  function post() {
    startPosting(async () => {
      try {
        await createPost(raw, ai);
        close();
      } catch (e) {
        setError(
          e instanceof Error && e.message === "Not logged in"
            ? "Sign in to post your failures."
            : "Couldn't post. Try again."
        );
      }
    });
  }

  return (
    <>
      {/* The fake input in the "Start a post" box */}
      <button
        onClick={() => setOpen(true)}
        className="flex-1 rounded-full border border-[#8C8C8C] px-4 text-left text-sm font-semibold text-muted-foreground hover:bg-accent"
      >
        Start a post about your latest failure
      </button>

      {open && (
        // Dark overlay; clicking outside the box closes it
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[10vh]"
          onClick={close}
        >
          <div
            className="w-full max-w-[552px] rounded-lg bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()} // clicks inside don't close it
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-semibold">Create a post</h2>
              <button onClick={close} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              {stage === "write" && (
                <>
                  <textarea
                    autoFocus
                    value={raw}
                    onChange={(e) => setRaw(e.target.value)}
                    placeholder="What did you fail at today? e.g. slept through my midterm"
                    rows={5}
                    className="w-full resize-none text-lg outline-none placeholder:text-muted-foreground"
                  />
                  <p className={`text-right text-xs ${tooLong ? "text-destructive" : "text-muted-foreground"}`}>
                    {raw.length}/280
                  </p>
                </>
              )}

              {stage === "loading" && (
                <div className="space-y-3 py-6 text-center">
                  <p className="animate-pulse text-sm font-semibold text-primary">✨ Consulting thought leaders…</p>
                  <p className="text-xs text-muted-foreground">Adding synergy. Removing accountability.</p>
                </div>
              )}

              {stage === "preview" && (
                <>
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">Your post (edit anything)</p>
                  <textarea
                    value={ai}
                    onChange={(e) => setAi(e.target.value)}
                    rows={12}
                    className="w-full resize-none rounded border p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">Originally: “{raw}”</p>
                </>
              )}

              {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-2 border-t px-6 py-3">
              {stage === "write" && (
                <button
                  onClick={translate}
                  disabled={tooShort || tooLong}
                  className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-brand-dark disabled:bg-muted disabled:text-muted-foreground"
                >
                  ✨ Make it professional
                </button>
              )}

              {stage === "preview" && (
                <>
                  <button
                    onClick={() => setStage("write")}
                    className="rounded-full px-4 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-accent"
                  >
                    ← Rewrite
                  </button>
                  <button
                    onClick={translate}
                    className="rounded-full border border-primary px-4 py-1.5 text-sm font-semibold text-primary hover:bg-brand-tint"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={post}
                    disabled={posting || ai.trim().length === 0}
                    className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-brand-dark disabled:opacity-50"
                  >
                    {posting ? "Posting…" : "Post"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}