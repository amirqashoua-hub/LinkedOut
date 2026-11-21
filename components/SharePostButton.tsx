"use client";

import { useState } from "react";
import { Send } from "lucide-react";

// "Send" on a post: opens the phone's share sheet (iMessage, WhatsApp…) where there is one,
// otherwise copies the post's link (/posts/<id>) so it can be pasted anywhere.
export default function SharePostButton({ postId }: { postId: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/posts/${postId}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "A failure on LockedOut", url });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return; // closed the share sheet
        // anything else: fall back to copying the link
      }
    }

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url); // very old browsers / blocked clipboard
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={share}
      title="Send this post to a friend"
      className="flex items-center justify-center gap-1.5 rounded py-3 text-sm font-semibold text-muted-foreground hover:bg-accent"
    >
      <Send className="h-5 w-5" />
      <span className="hidden sm:inline">{copied ? "Link copied!" : "Send"}</span>
    </button>
  );
}
