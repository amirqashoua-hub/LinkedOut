"use client";

import { useState, useTransition } from "react";
import { markAttended, markNotAttended } from "@/app/actions";

export default function AttendancePrompt({
  eventId,
  title,
}: {
  eventId: string;
  title: string;
}) {
  const [result, setResult] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function yes() {
    startTransition(async () => {
      const r = await markAttended(eventId);
      setDone(true);
      setResult(
        r.promoted
          ? `🎉 New position: ${r.title} (was ${r.previous_title})`
          : `Added to Experience: ${r.title}`
      );
    });
  }

  function no() {
    startTransition(async () => {
      await markNotAttended(eventId);
      setDone(true);
      setResult("Marked as not attended.");
    });
  }

  if (done) {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-gray-900">
        {result}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-blue-300 bg-blue-50 p-4">
      <p className="text-sm text-gray-900">
        Did you attend <span className="font-semibold">{title}</span>? Add to Experience.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={yes}
          disabled={pending}
          className="rounded-full bg-blue-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Yes, add it
        </button>
        <button
          onClick={no}
          disabled={pending}
          className="rounded-full border border-gray-400 px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          No
        </button>
      </div>
    </div>
  );
}
