"use client";

import { useEffect } from "react";
import { recordProfileView } from "@/app/actions";

export default function ProfileViewTracker({ profileId }: { profileId: string }) {
  useEffect(() => {
    recordProfileView(profileId).catch(() => {});
  }, [profileId]);
  return null;
}