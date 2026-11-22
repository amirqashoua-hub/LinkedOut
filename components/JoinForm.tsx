"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/app/actions";

// "Sophie McBroom!" → "sophie-mcbroom"
function suggestHandle(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // é → e
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
}

// Create an account + profile, then land on your new profile
export default function JoinForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [handleEdited, setHandleEdited] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault(); // don't reload the page
    setError(null);
    startTransition(async () => {
      const res = await signUp(email, password, name, handle);
      if (res.error || !res.handle) return setError(res.error ?? "Couldn't create your account. Try again.");
      router.push(`/in/${res.handle}`);
      router.refresh();
    });
  }

  const field = "mt-1 w-full rounded border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm">
        <span className="font-semibold">Your name</span>
        <input
          required
          maxLength={60}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!handleEdited) setHandle(suggestHandle(e.target.value));
          }}
          className={field}
        />
      </label>
      <label className="block text-sm">
        <span className="font-semibold">Handle</span>{" "}
        <span className="text-xs text-muted-foreground">(your profile link: lockedout/in/{handle || "your-handle"})</span>
        <input
          required
          maxLength={30}
          value={handle}
          onChange={(e) => {
            setHandleEdited(true);
            setHandle(e.target.value.toLowerCase());
          }}
          className={field}
        />
      </label>
      <label className="block text-sm">
        <span className="font-semibold">Email</span>
        <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
      </label>
      <label className="block text-sm">
        <span className="font-semibold">Password</span>{" "}
        <span className="text-xs text-muted-foreground">(8+ characters)</span>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={field}
        />
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Creating your account…" : "Join LockedOut"}
      </button>
    </form>
  );
}
