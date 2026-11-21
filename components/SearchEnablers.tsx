"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { searchProfiles, type ProfileResult } from "@/app/actions";
import Avatar from "@/components/Avatar";

// Nav search: type a name, see matching profiles, click (or Enter) to open one
export default function SearchEnablers() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0); // highlighted result (arrow keys)
  const box = useRef<HTMLDivElement>(null);
  const latest = useRef(0); // ignore answers to older searches

  // Search 200ms after the user stops typing (loading/clearing is set in onChange below)
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const id = ++latest.current;
    const timer = setTimeout(async () => {
      try {
        const found = await searchProfiles(q);
        if (id === latest.current) {
          setResults(found);
          setActive(0);
        }
      } finally {
        if (id === latest.current) setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Close when clicking outside
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  function go(person: ProfileResult) {
    setOpen(false);
    setQuery("");
    router.push(`/in/${person.handle}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showPanel = open && query.trim().length > 0;

  return (
    <div ref={box} className="relative ml-3 hidden md:block">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={query}
        onChange={(e) => {
          const value = e.target.value;
          setQuery(value);
          setOpen(true);
          if (value.trim()) setLoading(true);
          else {
            latest.current++; // drop any search still in flight
            setResults([]);
            setLoading(false);
          }
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search for enablers"
        aria-label="Search for enablers"
        role="combobox"
        aria-expanded={showPanel}
        className="h-[34px] w-[280px] rounded bg-muted pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />

      {showPanel && (
        <div className="absolute left-0 top-full z-50 mt-1 w-[360px] overflow-hidden rounded-lg border bg-card shadow-lg">
          {results.length > 0 ? (
            <ul role="listbox">
              {results.map((p, i) => (
                <li key={p.id} role="option" aria-selected={i === active}>
                  <button
                    onMouseDown={(e) => e.preventDefault()} // keep focus so the click lands
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(p)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left ${i === active ? "bg-accent" : ""}`}
                  >
                    <Avatar name={p.full_name} url={p.avatar_url} size={36} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{p.full_name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{p.headline ?? `@${p.handle}`}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              {loading ? "Searching…" : `No enablers named "${query.trim()}". Yet.`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
