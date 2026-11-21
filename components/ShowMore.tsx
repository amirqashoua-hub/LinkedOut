"use client";

import { useState, type ReactNode } from "react";

type Props = {
  items: ReactNode[]; // ready-made <li> elements (built on the server)
  initial: number; // how many to show before "Show all"
  noun: string; // e.g. "posts" → "Show all 5 posts →"
};

// Generic "show the first few, expand the rest" list, with LinkedIn's full-width footer button
export default function ShowMore({ items, initial, noun }: Props) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, initial);

  return (
    <>
      <ul className="divide-y">{visible}</ul>
      {items.length > initial && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="-mx-6 -mb-5 mt-2 block w-[calc(100%+3rem)] rounded-b-lg border-t py-3 text-center text-sm font-semibold text-muted-foreground hover:bg-accent"
        >
          {showAll ? "Show less ↑" : `Show all ${items.length} ${noun} →`}
        </button>
      )}
    </>
  );
}
