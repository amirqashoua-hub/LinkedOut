"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Newspaper, X } from "lucide-react";
import { createPost, createAnonymousPost } from "@/app/actions";
import { createClient } from "@/utils/supabase/client";

// TEMP: set to true to skip the AI and use a fake post (while /api/translate is broken).
// Set back to false before the demo!
const SKIP_AI = false;

const TIMEOUT_MS = 20000; // give up on the AI after 20 seconds
const PHOTO_BUCKET = "visit-photos"; // public bucket that already accepts uploads (+1 photos)
const MAX_MB = 5;

type Stage = "write" | "loading" | "preview";

// variant "confession": the "Write confession" button, which opens with "Post anonymously" on
export default function PostComposer({ variant = "post" }: { variant?: "post" | "confession" }) {
  const [open, setOpen] = useState(false);
  const [anonymous, setAnonymous] = useState(variant === "confession");
  const [stage, setStage] = useState<Stage>("write");
  const [raw, setRaw] = useState(""); // what the user typed
  const [ai, setAi] = useState(""); // the AI version (editable)
  const [error, setError] = useState<string | null>(null);
  const [posting, startPosting] = useTransition();
  const [photo, setPhoto] = useState<File | null>(null); // chosen photo (uploaded only when posting)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null); // local preview URL
  const fileInput = useRef<HTMLInputElement>(null);

  const tooShort = raw.trim().length < 3;
  const tooLong = raw.length > 280;

  function close() {
    setOpen(false);
    setStage("write");
    setRaw("");
    setAi("");
    setError(null);
    removePhoto();
    setAnonymous(variant === "confession");
  }

  // Anonymous posts can't have photos (a photo could give you away), so drop any attached one
  function toggleAnonymous(next: boolean) {
    setAnonymous(next);
    if (next) removePhoto();
  }

  function choosePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("That's not a photo.");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`Photo is over ${MAX_MB} MB. Try a smaller one.`);
    setError(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file)); // show it right away, no upload yet
  }

  function removePhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
  }

  // Uploads the chosen photo to Supabase Storage and returns its public URL
  async function uploadPhoto(file: File): Promise<string> {
    const supabase = createClient(); // browser client: uses your login cookie
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not logged in");
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/posts/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, { contentType: file.type });
    if (error) throw new Error("upload");
    return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
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

  // Calls Person 2's server action; the feed refreshes by itself afterwards.
  // Without the AI, the original text is also what the feed shows.
  function post(text: string = ai) {
    startPosting(async () => {
      try {
        if (anonymous) {
          const res = await createAnonymousPost(raw.trim(), text.trim());
          if (res.error) return setError(res.error);
          return close();
        }
        const photoUrl = photo ? await uploadPhoto(photo) : undefined; // upload only now
        const res = await createPost(raw.trim(), text.trim(), photoUrl);
        if (res.error) return setError(res.error); // real reason from the server
        close();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        setError(
          msg === "Not logged in"
            ? "Sign in to post your failures."
            : msg === "upload"
              ? "Couldn't upload the photo. Remove it or try again."
              : "Couldn't post. Try again."
        );
      }
    });
  }

  return (
    <>
      {variant === "confession" ? (
        // "Write confession" under the "Start a post" box
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded px-2 py-3 text-sm font-semibold text-muted-foreground hover:bg-accent"
        >
          <Newspaper className="h-5 w-5 text-[#E06847]" />
          Write confession
        </button>
      ) : (
        // The fake input in the "Start a post" box
        <button
          onClick={() => setOpen(true)}
          className="flex-1 rounded-full border border-[#8C8C8C] px-4 text-left text-sm font-semibold text-muted-foreground hover:bg-accent"
        >
          Start a post about your latest failure
        </button>
      )}

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
              <h2 className="text-xl font-semibold">{anonymous ? "Write a confession" : "Create a post"}</h2>
              <button onClick={close} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              {/* Anonymous switch */}
              <label className="mb-3 flex cursor-pointer items-start gap-3 rounded-lg border p-3">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => toggleAnonymous(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                />
                <span className="text-sm">
                  <span className="font-semibold">🕵️ Post anonymously</span>
                  <span className="block text-xs text-muted-foreground">
                    Shows as &quot;Anonymous Confessor&quot;. Nobody can see it was you, not even your enablers. No photos.
                  </span>
                </span>
              </label>

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

              {/* Attached photo (write + preview stages) */}
              {stage !== "loading" && photoPreview && (
                <div className="relative mt-3 w-fit">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="Attached photo" className="max-h-64 rounded-lg border object-contain" />
                  <button
                    onClick={removePhoto}
                    aria-label="Remove photo"
                    className="absolute top-2 right-2 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {stage !== "loading" && !photoPreview && !anonymous && (
                <button
                  onClick={() => fileInput.current?.click()}
                  className="mt-2 flex items-center gap-2 rounded px-2 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-accent"
                >
                  <ImagePlus className="h-5 w-5 text-primary" /> Add photo evidence
                </button>
              )}
              <input ref={fileInput} type="file" accept="image/*" onChange={choosePhoto} className="hidden" />

              {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-2 border-t px-6 py-3">
              {stage === "write" && (
                <button
                  onClick={() => post(raw)}
                  disabled={tooShort || tooLong || posting}
                  className="rounded-full px-4 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-accent disabled:opacity-50"
                >
                  {posting ? "Posting…" : anonymous ? "Confess as is" : "Post as is"}
                </button>
              )}
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
                    onClick={() => post()}
                    disabled={posting || ai.trim().length === 0}
                    className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-brand-dark disabled:opacity-50"
                  >
                    {posting ? "Posting…" : anonymous ? "Confess" : "Post"}
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