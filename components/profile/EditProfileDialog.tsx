"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Camera, ImageIcon } from "lucide-react";
import { updateProfile } from "@/app/actions";
import { createClient } from "@/utils/supabase/client";
import { BIO_MAX, NAME_MAX, HEADLINE_MAX } from "@/lib/profile";
import Avatar from "@/components/Avatar";

const BUCKET = "avatars"; // public bucket for profile photos (banners go there too)
const MAX_MB = 5;

type Profile = {
  full_name: string;
  headline: string | null;
  program: string | null;
  year: string | null;
  bio?: string | null;
  avatar_url: string | null;
  banner_url: string | null;
};

// Uploads an image to Storage under your user folder and returns its public URL
async function uploadImage(file: File, kind: "avatar" | "banner"): Promise<string> {
  const supabase = createClient(); // browser client: uses your login cookie
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in first.");
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw new Error(`Couldn't upload the ${kind === "avatar" ? "photo" : "banner"}.`);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export default function EditProfileDialog({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: profile.full_name,
    headline: profile.headline ?? "",
    program: profile.program ?? "",
    year: profile.year ?? "",
    bio: profile.bio ?? "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const avatarInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  // free the local preview URLs when they change or the dialog unmounts
  useEffect(() => () => void (avatarPreview && URL.revokeObjectURL(avatarPreview)), [avatarPreview]);
  useEffect(() => () => void (bannerPreview && URL.revokeObjectURL(bannerPreview)), [bannerPreview]);

  function openDialog() {
    // start from the current saved values every time
    setForm({
      full_name: profile.full_name,
      headline: profile.headline ?? "",
      program: profile.program ?? "",
      year: profile.year ?? "",
      bio: profile.bio ?? "",
    });
    setAvatarFile(null);
    setBannerFile(null);
    setAvatarPreview(null);
    setBannerPreview(null);
    setError(null);
    setOpen(true);
  }

  function pick(kind: "avatar" | "banner", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("That's not an image.");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`Image is over ${MAX_MB} MB.`);
    setError(null);
    if (kind === "avatar") {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  }

  function save(e: React.FormEvent) {
    e.preventDefault(); // don't reload the page
    if (form.full_name.trim().length === 0) return setError("Your name can't be empty.");
    if (form.bio.length > BIO_MAX) return setError(`Bio must be ${BIO_MAX} characters or less.`);
    setError(null);
    startTransition(async () => {
      try {
        // upload new images first (only if changed), then save all fields at once
        const [avatar_url, banner_url] = await Promise.all([
          avatarFile ? uploadImage(avatarFile, "avatar") : Promise.resolve(undefined),
          bannerFile ? uploadImage(bannerFile, "banner") : Promise.resolve(undefined),
        ]);
        const res = await updateProfile({ ...form, avatar_url, banner_url });
        if (res.error) return setError(res.error);
        setOpen(false); // the profile refreshes with the new details
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't save your profile.");
      }
    });
  }

  const field = "mt-1 w-full rounded border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring";
  const bannerSrc = bannerPreview ?? profile.banner_url;

  return (
    <>
      <button
        onClick={openDialog}
        className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-brand-dark"
      >
        Edit profile
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-[6vh]" onClick={() => setOpen(false)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="w-full max-w-[560px] rounded-lg bg-card shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-semibold">Edit profile</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                ✕
              </button>
            </div>

            {/* Banner + photo with change buttons */}
            <div className="relative">
              {bannerSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bannerSrc} alt="" className="h-28 w-full object-cover" />
              ) : (
                <div className="h-28 bg-linear-to-r from-[var(--banner-from)] to-[var(--banner-to)]" />
              )}
              <button
                type="button"
                onClick={() => bannerInput.current?.click()}
                className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white hover:bg-black/80"
              >
                <ImageIcon className="h-4 w-4" /> Change banner
              </button>
              <div className="absolute -bottom-10 left-6 rounded-full border-4 border-white">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="" className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <Avatar name={form.full_name} url={profile.avatar_url} size={80} />
                )}
                <button
                  type="button"
                  onClick={() => avatarInput.current?.click()}
                  aria-label="Change profile photo"
                  className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground hover:bg-brand-dark"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <input ref={bannerInput} type="file" accept="image/*" onChange={(e) => pick("banner", e)} className="hidden" />
              <input ref={avatarInput} type="file" accept="image/*" onChange={(e) => pick("avatar", e)} className="hidden" />
            </div>

            <div className="space-y-3 px-6 pt-14 pb-4">
              <label className="block text-sm">
                <span className="font-semibold">Name</span>
                <input value={form.full_name} maxLength={NAME_MAX} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={field} />
              </label>
              <label className="block text-sm">
                <span className="font-semibold">Headline</span>
                <input
                  value={form.headline}
                  maxLength={HEADLINE_MAX}
                  placeholder="e.g. VP of Skipping 8:30s | #OpenToNothing"
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                  className={field}
                />
              </label>
              <div className="flex gap-3">
                <label className="block w-2/3 text-sm">
                  <span className="font-semibold">Program</span>
                  <input value={form.program} maxLength={80} placeholder="B.A. Economics" onChange={(e) => setForm({ ...form, program: e.target.value })} className={field} />
                </label>
                <label className="block w-1/3 text-sm">
                  <span className="font-semibold">Year</span>
                  <input value={form.year} maxLength={20} placeholder="U2" onChange={(e) => setForm({ ...form, year: e.target.value })} className={field} />
                </label>
              </div>
              <label className="block text-sm">
                <span className="font-semibold">About</span>
                <textarea
                  value={form.bio}
                  rows={3}
                  maxLength={BIO_MAX}
                  placeholder="A short bio. Lowered expectations welcome."
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className={`${field} resize-none`}
                />
                <span className={`block text-right text-xs ${form.bio.length >= BIO_MAX ? "text-destructive" : "text-muted-foreground"}`}>
                  {form.bio.length}/{BIO_MAX}
                </span>
              </label>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="flex justify-end gap-2 border-t px-6 py-3">
              <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-accent">
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-brand-dark disabled:opacity-50"
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
