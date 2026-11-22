"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Camera } from "lucide-react";
import { logVisit } from "@/app/actions";
import { createClient } from "@/utils/supabase/client";

type Props = { placeId: string; placeName: string; firstName: string };

const BUCKET = "visit-photos"; // Person 2's public storage bucket
const MAX_MB = 5;
const CAPTION_MAX = 280; // what you type (also the AI rewrite's input limit)
const AI_CAPTION_MAX = 1500; // after "Make it professional" the caption can be longer
const AI_TIMEOUT_MS = 20000;

export default function PlusOneButton({ placeId, placeName, firstName }: Props) {
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ big: boolean; text: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  // 📷 flow: the chosen photo waits here while you write a caption
  const [chosen, setChosen] = useState<{ file: File; preview: string } | null>(null);
  const [caption, setCaption] = useState("");
  const [original, setOriginal] = useState<string | null>(null); // what you typed, once the AI rewrote it
  const [translating, setTranslating] = useState(false);
  const [captionError, setCaptionError] = useState<string | null>(null);

  // ✨ Make it professional: the same AI rewrite as the post composer (Person 3's /api/translate)
  async function professionalize() {
    const raw = (original ?? caption).trim();
    if (raw.length < 3) return setCaptionError("Write at least a few words first.");
    if (raw.length > CAPTION_MAX) return setCaptionError(`Keep it under ${CAPTION_MAX} characters for the AI.`);
    setCaptionError(null);
    setTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: raw }),
        signal: AbortSignal.timeout(AI_TIMEOUT_MS),
      });
      const body = await res.json();
      if (!res.ok) return setCaptionError(body.reason ?? "Couldn't rewrite that. Try something else.");
      setOriginal(raw);
      setCaption(body.aiText);
    } catch (e) {
      setCaptionError(
        e instanceof DOMException && e.name === "TimeoutError" ? "The AI is taking too long. Try again." : "Network error. Try again."
      );
    } finally {
      setTranslating(false);
    }
  }

  // free the local preview when it changes or the component goes away
  useEffect(() => () => void (chosen && URL.revokeObjectURL(chosen.preview)), [chosen]);

  function show(big: boolean, text: string) {
    setToast({ big, text });
    setTimeout(() => setToast(null), 5000); // auto-hide after 5s
  }

  // Logs the visit (optionally with a photo URL) and shows the right toast
  async function log(photoUrl?: string, postCaption?: string, rawCaption?: string) {
    try {
      const res = await logVisit(placeId, photoUrl, postCaption, rawCaption);
      if (res.promoted) {
        show(true, `🎉 ${firstName} started a new position as ${res.title} at ${placeName}`);
      } else {
        show(false, `${photoUrl ? "📸 Visit logged and posted to your feed." : "Visit logged."} ${res.count} visits at ${placeName}.`);
      }
    } catch {
      show(false, "❌ Couldn't log that visit. Sign in and try again.");
    }
  }

  // Plain +1, no photo
  function handleClick() {
    startTransition(() => log());
  }

  // 📷 step 1: pick a photo, then write a caption in the little window below
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file) return;

    if (!file.type.startsWith("image/")) return show(false, "❌ That's not a photo.");
    if (file.size > MAX_MB * 1024 * 1024) return show(false, `❌ Photo is over ${MAX_MB} MB. Try a smaller one.`);

    setCaption("");
    setOriginal(null);
    setCaptionError(null);
    setChosen({ file, preview: URL.createObjectURL(file) });
  }

  // 📷 step 2: upload the photo to Supabase Storage from the browser, then +1 with its URL + caption
  function postPhoto() {
    if (!chosen) return;
    const { file } = chosen;
    const postCaption = caption.trim();
    const rawCaption = original ?? undefined; // what you typed, if the AI rewrote it
    setChosen(null);

    startTransition(async () => {
      setUploading(true);
      try {
        const supabase = createClient(); // browser client: uses your login cookie
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return show(false, "❌ Sign in to add evidence.");

        // One folder per user, unique file name per upload
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user.id}/${placeId}-${Date.now()}.${ext}`;

        const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
        if (error) return show(false, "❌ Couldn't upload the photo. Try again, or +1 without it.");

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        await log(data.publicUrl, postCaption, rawCaption);
      } finally {
        setUploading(false);
      }
    });
  }

  const busy = pending || uploading;

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={handleClick}
          disabled={busy}
          className="rounded-full border border-primary px-3 py-1 text-sm font-semibold text-primary hover:bg-brand-tint disabled:opacity-50"
        >
          {pending && !uploading ? "…" : "+1"}
        </button>

        {/* Hidden file picker, opened by the camera button (phones offer camera or library) */}
        <input ref={fileInput} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <button
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          title="+1 with photo evidence"
          aria-label="+1 with photo evidence"
          className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
        >
          {uploading ? <span className="block h-5 w-5 animate-pulse text-center text-xs leading-5">…</span> : <Camera className="h-5 w-5" />}
        </button>
      </div>

      {/* Caption window for a 📷 +1 */}
      {chosen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[6vh]" onClick={() => setChosen(null)}>
          <div className="flex max-h-[88vh] w-full max-w-[480px] flex-col rounded-lg bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-semibold">+1 at {placeName}</h2>
              <button onClick={() => setChosen(null)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                ✕
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={chosen.preview} alt="Your photo" className="max-h-72 w-full rounded-lg border object-contain" />
              <label className="block text-sm">
                <span className="font-semibold">Caption</span>{" "}
                <span className="text-muted-foreground">(optional, leave empty for an auto caption)</span>
                <textarea
                  autoFocus
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={original ? AI_CAPTION_MAX : CAPTION_MAX}
                  rows={original ? 8 : 3}
                  disabled={translating}
                  placeholder={`e.g. I went to ${placeName} last night!`}
                  className="mt-1 w-full resize-none rounded border p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="block text-right text-xs text-muted-foreground">
                  {caption.length}/{original ? AI_CAPTION_MAX : CAPTION_MAX}
                </span>
              </label>
              {translating && <p className="animate-pulse text-sm font-semibold text-primary">✨ Consulting thought leaders…</p>}
              {original && !translating && (
                <p className="text-xs text-muted-foreground">
                  Originally: “{original}”{" "}
                  <button
                    onClick={() => {
                      setCaption(original);
                      setOriginal(null);
                    }}
                    className="font-semibold text-primary hover:underline"
                  >
                    Undo
                  </button>
                </p>
              )}
              {captionError && <p className="text-sm text-destructive">{captionError}</p>}
              <p className="text-xs text-muted-foreground">This adds a visit and posts the photo to your feed.</p>
            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t px-6 py-3">
              <button onClick={() => setChosen(null)} className="rounded-full px-4 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-accent">
                Cancel
              </button>
              <button
                onClick={professionalize}
                disabled={translating}
                className="rounded-full border border-primary px-4 py-1.5 text-sm font-semibold text-primary hover:bg-brand-tint disabled:opacity-50"
              >
                {original ? "Regenerate" : "✨ Make it professional"}
              </button>
              <button
                onClick={postPhoto}
                disabled={translating}
                className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-brand-dark disabled:opacity-50"
              >
                +1 and post
              </button>
            </div>
          </div>
        </div>
      )}

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
