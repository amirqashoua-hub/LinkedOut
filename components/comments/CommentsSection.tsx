"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { addComment, deleteComment } from "@/app/actions";
import type { PostComment } from "@/lib/data";
import Avatar from "@/components/Avatar";

const MAX = 500;

// A comment plus its "3h" text, worked out on the server (no hydration mismatch)
export type ShownComment = PostComment & { ago: string };

type Props = {
  postId: string;
  comments: ShownComment[];
  meId: string | null;
  myName: string | null;
  myAvatar: string | null;
};

// Comment box + list under a post. The list comes from the server and refreshes after
// adding or deleting (the actions revalidate the page).
export default function CommentsSection({ postId, comments, meId, myName, myAvatar }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault(); // don't reload the page
    const body = text.trim();
    if (!body) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await addComment(postId, body);
        if (res.error) setError(res.error);
        else setText(""); // the new comment appears when the page refreshes
      } catch {
        setError("Couldn't post your comment");
      }
    });
  }

  function remove(id: string) {
    if (!window.confirm("Delete this comment?")) return;
    setError(null);
    setDeleting(id);
    startTransition(async () => {
      try {
        const res = await deleteComment(id);
        if (res.error) setError(res.error);
      } catch {
        setError("Couldn't delete that comment");
      } finally {
        setDeleting(null);
      }
    });
  }

  return (
    <div className="px-4 pb-3">
      {/* Add a comment */}
      {meId ? (
        <form onSubmit={submit} className="flex items-start gap-2 pt-1">
          <Avatar name={myName} url={myAvatar} size={36} />
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                // Enter posts, Shift+Enter adds a new line
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              rows={1}
              maxLength={MAX}
              placeholder="Add a comment…"
              className="w-full resize-none rounded-2xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {text.trim() && (
              <div className="mt-1 flex items-center justify-between">
                <span className={`text-xs ${text.length >= MAX ? "text-destructive" : "text-muted-foreground"}`}>
                  {text.length}/{MAX}
                </span>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-brand-dark disabled:opacity-50"
                >
                  {pending && !deleting ? "Posting…" : "Post"}
                </button>
              </div>
            )}
          </div>
        </form>
      ) : (
        <p className="pt-1 text-xs text-muted-foreground">Sign in to comment.</p>
      )}

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

      {/* Comments, oldest first */}
      {comments.length > 0 && (
        <ul className="mt-3 space-y-3">
          {comments.map((c) => {
            const href = c.author ? `/in/${c.author.handle}` : "#";
            return (
              <li key={c.id} className={`flex gap-2 ${deleting === c.id ? "opacity-50" : ""}`}>
                <Link href={href} className="shrink-0">
                  <Avatar name={c.author?.full_name ?? "?"} url={c.author?.avatar_url} size={36} />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="rounded-lg bg-muted px-3 py-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <Link href={href} className="truncate text-sm font-semibold hover:text-primary hover:underline">
                        {c.author?.full_name ?? "Someone"}
                      </Link>
                      <span className="shrink-0 text-xs text-muted-foreground">{c.ago}</span>
                    </div>
                    {c.author?.headline && (
                      <p className="truncate text-xs text-muted-foreground">{c.author.headline}</p>
                    )}
                    <p className="mt-1 whitespace-pre-line break-words text-sm">{c.body}</p>
                  </div>
                  {meId === c.user_id && (
                    <button
                      onClick={() => remove(c.id)}
                      disabled={pending}
                      className="mt-0.5 ml-3 text-xs font-semibold text-muted-foreground hover:text-destructive disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
