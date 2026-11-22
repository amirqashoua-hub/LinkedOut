"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { formatPostText } from "@/lib/postText";

// Post text, cut off after 10 lines with "…see more". The button only shows when the text
// really is cut off (measured in the browser), so posts that fit don't get a pointless one.
export default function SeeMoreText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || open) return;
    const check = () => setClamped(el.scrollHeight > el.clientHeight + 1);
    check();
    // re-check when the width changes (window resize, sidebar layout)
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, open]);

  return (
    <div className="px-4 text-sm">
      <p ref={ref} className={`whitespace-pre-line ${open ? "" : "line-clamp-10"}`}>
        {formatPostText(text)}
      </p>
      {clamped && !open && (
        <button onClick={() => setOpen(true)} className="text-muted-foreground hover:text-primary hover:underline">
          …see more
        </button>
      )}
    </div>
  );
}
