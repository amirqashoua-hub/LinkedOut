"use client";

import { useState } from "react";
import { formatPostText } from "@/lib/postText";

export default function SeeMoreText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 220;

  return (
    <div className="px-4 text-sm">
      <p className={`whitespace-pre-line ${long && !open ? "line-clamp-3" : ""}`}>{formatPostText(text)}</p>
      {long && !open && (
        <button
          onClick={() => setOpen(true)}
          className="text-muted-foreground hover:text-primary hover:underline"
        >
          …see more
        </button>
      )}
    </div>
  );
}