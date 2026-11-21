"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelRsvp } from "@/app/actions";

export default function CancelPlan({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          await cancelRsvp(eventId);
          router.refresh();
        })
      }
      className="text-sm font-semibold text-gray-600 hover:underline disabled:opacity-50"
    >
      Cancel
    </button>
  );
}