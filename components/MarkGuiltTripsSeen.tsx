"use client";

import { useEffect } from "react";
import { markGuiltTripsSeen } from "@/app/actions";

// On the Guilt Trips page: once it's open, everything on it counts as seen (clears the red badge)
export default function MarkGuiltTripsSeen() {
  useEffect(() => {
    markGuiltTripsSeen().catch(() => {});
  }, []);
  return null;
}
