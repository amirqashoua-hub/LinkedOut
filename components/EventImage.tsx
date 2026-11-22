"use client";

import { useState } from "react";

// The event's picture (scraped from the event site, or an ad poster), shown full width on the
// event page. Hides itself if the image link is broken, like the event cards do.
export default function EventImage({ src, alt }: { src: string; alt: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setOk(false)}
      className="max-h-[420px] w-full rounded-t-lg border-b bg-muted object-contain"
    />
  );
}
