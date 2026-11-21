"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { removeVisitPhoto } from "@/app/actions";

type Props = {
  photoUrl: string;
  placeId: string;
  placeName: string;
  canRemove: boolean; // only on your own profile
};

// The latest +1 photo on an Experience entry; on your own profile it has a ✕ to remove it
export default function VisitPhoto({ photoUrl, placeId, placeName, canRemove }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleRemove() {
    if (!window.confirm(`Remove the photo from ${placeName}? Your visit count stays.`)) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await removeVisitPhoto(placeId);
        if (res.error) setError(res.error); // otherwise the page refreshes without the photo
      } catch {
        setError("Couldn't remove the photo");
      }
    });
  }

  return (
    <div className="mt-2 w-fit">
      <div className="relative">
        <a href={photoUrl} target="_blank" rel="noopener noreferrer" title="Open full photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt={`Evidence from ${placeName}`}
            className={`h-20 w-32 rounded border object-cover hover:opacity-90 ${pending ? "opacity-40" : ""}`}
          />
        </a>
        {canRemove && (
          <button
            onClick={handleRemove}
            disabled={pending}
            title="Remove photo"
            aria-label={`Remove photo from ${placeName}`}
            className="absolute -top-2 -right-2 rounded-full border-2 border-white bg-black/75 p-0.5 text-white hover:bg-destructive disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <span className="mt-1 block text-xs text-muted-foreground">📸 Latest evidence</span>
      {error && <span className="block text-xs text-destructive">{error}</span>}
    </div>
  );
}
