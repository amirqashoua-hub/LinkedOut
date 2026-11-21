"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { deletePost } from "@/app/actions";

// "⋯" menu on your own posts, with Delete (LinkedIn-style)
export default function PostMenu({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside the menu
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  function handleDelete() {
    setOpen(false);
    if (!window.confirm("Delete this post? This can't be undone. (Your shame, however, is forever.)")) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await deletePost(postId);
        if (res.error) setError(res.error); // otherwise the feed refreshes without the post
      } catch {
        setError("Couldn't delete that post");
      }
    });
  }

  return (
    <div ref={ref} className="relative ml-auto self-start">
      <button
        onClick={() => setOpen(!open)}
        disabled={pending}
        aria-label="Post options"
        aria-expanded={open}
        className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
      >
        {pending ? <span className="block h-5 w-5 text-center text-xs leading-5">…</span> : <MoreHorizontal className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border bg-card py-1 shadow-lg">
          <button
            onClick={handleDelete}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-destructive hover:bg-accent"
          >
            <Trash2 className="h-4 w-4" /> Delete post
          </button>
        </div>
      )}

      {error && (
        <p className="absolute right-0 top-full z-20 mt-1 w-56 rounded bg-card px-2 py-1 text-xs text-destructive shadow">
          {error}
        </p>
      )}
    </div>
  );
}
