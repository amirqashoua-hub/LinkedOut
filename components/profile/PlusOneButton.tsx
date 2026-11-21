"use client";

import { useRef, useState, useTransition } from "react";
import { Camera } from "lucide-react";
import { logVisit } from "@/app/actions";
import { createClient } from "@/utils/supabase/client";

type Props = { placeId: string; placeName: string; firstName: string };

const BUCKET = "visit-photos"; // Person 2's public storage bucket
const MAX_MB = 5;

export default function PlusOneButton({ placeId, placeName, firstName }: Props) {
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ big: boolean; text: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function show(big: boolean, text: string) {
    setToast({ big, text });
    setTimeout(() => setToast(null), 5000); // auto-hide after 5s
  }

  // Logs the visit (optionally with a photo URL) and shows the right toast
  async function log(photoUrl?: string) {
    try {
      const res = await logVisit(placeId, photoUrl);
      if (res.promoted) {
        show(true, `🎉 ${firstName} started a new position as ${res.title} at ${placeName}`);
      } else {
        show(false, `${photoUrl ? "📸 Visit logged with evidence." : "Visit logged."} ${res.count} visits at ${placeName}.`);
      }
    } catch {
      show(false, "❌ Couldn't log that visit. Are you signed in?");
    }
  }

  // Plain +1, no photo
  function handleClick() {
    startTransition(() => log());
  }

  // 📷: upload the chosen photo to Supabase Storage from the browser, then +1 with its URL
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file) return;

    if (!file.type.startsWith("image/")) return show(false, "❌ That's not a photo.");
    if (file.size > MAX_MB * 1024 * 1024) return show(false, `❌ Photo is over ${MAX_MB} MB. Try a smaller one.`);

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
        await log(data.publicUrl);
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
          className="rounded-full border border-primary px-3 py-1 text-sm font-semibold text-primary hover:bg-[#EBF4FD] disabled:opacity-50"
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
