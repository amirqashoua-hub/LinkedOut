"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const BUCKET = "avatars"; // public bucket the seed profile pictures already live in
const MAX_MB = 5;

// Camera button over your own big profile picture: upload a new photo, save it to your profile
export default function AvatarUpload() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return;

    setError(null);
    if (!file.type.startsWith("image/")) return setError("That's not a photo.");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`Photo is over ${MAX_MB} MB.`);

    setBusy(true);
    try {
      const supabase = createClient(); // browser client: uses your login cookie
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return setError("Sign in to change your photo.");

      // 1. Upload to Storage, in a folder named after your user id
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
      if (upErr) return setError("Couldn't upload the photo.");

      // 2. Save the public URL on your profile
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id);
      if (dbErr) return setError("Uploaded, but couldn't save it to your profile.");

      // 3. Re-render the server components (header, nav avatar, sidebar) with the new picture
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input ref={fileInput} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <button
        onClick={() => fileInput.current?.click()}
        disabled={busy}
        title="Change profile photo"
        aria-label="Change profile photo"
        className="absolute right-1 bottom-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow hover:bg-brand-dark disabled:opacity-60"
      >
        {busy ? <span className="animate-pulse text-xs">…</span> : <Camera className="h-5 w-5" />}
      </button>
      {error && (
        <p className="absolute top-full left-0 mt-1 w-56 rounded bg-card px-2 py-1 text-xs text-destructive shadow">
          {error}
        </p>
      )}
    </>
  );
}
