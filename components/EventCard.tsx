"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { rsvp, cancelRsvp } from "@/app/actions";
import type { getEvents } from "@/lib/data";

type EventRow = Awaited<ReturnType<typeof getEvents>>[number];

// "Company logo" colours, picked from the org name so each org keeps its colour
const LOGO_COLORS = ["bg-[#E7A33E]", "bg-[#5F9B41]", "bg-[#8F5849]", "bg-[#378FE9]", "bg-[#E06847]", "bg-[#915907]"];
function logoColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 997;
  return LOGO_COLORS[h % LOGO_COLORS.length];
}

// Fake "applicants" so every listing looks popular: stable per event id (Person 3)
function fakeApplicants(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 1000;
  return 40 + (h % 280);
}

// Built from parts so the server and the browser produce identical text (Person 3)
function formatWhen(iso: string | null) {
  if (!iso) return "Date TBD";
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Montreal",
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value])
  );
  return `${parts.weekday}, ${parts.month} ${parts.day} · ${parts.hour}:${parts.minute} ${parts.dayPeriod}`;
}

export default function EventCard({ event }: { event: EventRow }) {
  const [applied, setApplied] = useState(event.hasRsvped);
  const [pending, startTransition] = useTransition();

  // real RSVP count, adjusted for the optimistic toggle, on top of the fake base
  const delta = (applied ? 1 : 0) - (event.hasRsvped ? 1 : 0);
  const applicants = fakeApplicants(event.id) + (event.applicants ?? 0) + delta;

  const org = event.org ?? "McGill";

  function toggle() {
    const next = !applied;
    setApplied(next); // optimistic
    startTransition(async () => {
      try {
        await (next ? rsvp(event.id) : cancelRsvp(event.id));
      } catch {
        setApplied(!next); // roll back if the action fails (e.g. not logged in)
      }
    });
  }

  return (
    <li className="flex gap-3 px-4 py-4">
      {/* "Company logo": coloured letter tile */}
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded text-xl font-bold text-white ${logoColor(org)}`}
      >
        {org[0]}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-primary hover:underline">
          <Link href={`/events/${event.id}`}>{event.title}</Link>
        </h3>
        <p className="text-sm">{org}</p>
        <p className="text-sm text-muted-foreground">{event.location ?? "Location TBD"} · On-site</p>
        <p className="text-sm text-muted-foreground">{formatWhen(event.starts_at)}</p>

        {event.description && <p className="mt-2 line-clamp-2 text-sm">{event.description}</p>}

        {/* LinkedIn-style meta line */}
        <p className="mt-2 flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
          <span className="font-semibold text-[var(--success)]">Actively recruiting</span>
          <span>·</span>
          <span>{applicants} applicants</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <span className="rounded-sm bg-primary px-0.5 text-[10px] font-bold leading-tight text-primary-foreground">
              in
            </span>
            Easy Apply
          </span>
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={toggle}
            disabled={pending}
            title={applied ? "Click to withdraw your application" : undefined}
            className={
              applied
                ? "flex items-center gap-1 rounded-full border border-primary px-4 py-1.5 text-sm font-semibold text-primary hover:bg-brand-tint disabled:opacity-50"
                : "rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-brand-dark disabled:opacity-50"
            }
          >
            {applied ? (
              <>
                <Check className="h-4 w-4" /> Applied
              </>
            ) : (
              "Easy Apply"
            )}
          </button>
                    {event.source === "evelya" && event.source_url?.startsWith("https://") && (
            <a
              href={event.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-gray-400 px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Get tickets on Evelya ↗ </a>
            )}
        </div>
      </div>
    </li>
  );
}