"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  trigger: ReactNode; // what you click (e.g. avatar + "Me ▾")
  children: ReactNode; // the menu contents (can be built on the server)
};

// A simple dropdown: click to open, click outside or pick an item to close
export default function Dropdown({ trigger, children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking anywhere outside the dropdown
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  return (
    <div ref={ref} className="relative h-full">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="h-full">
        {trigger}
      </button>

      {open && (
        <div
          // Close after a click inside, but let the click (e.g. a form submit) finish first
          onClick={() => setTimeout(() => setOpen(false), 0)}
          className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border bg-card shadow-lg"
        >
          {children}
        </div>
      )}
    </div>
  );
}