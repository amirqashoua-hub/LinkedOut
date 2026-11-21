import { Suspense } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import RightSidebar from "@/components/RightSidebar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ExperienceSection from "@/components/profile/ExperienceSection";
import EducationSection from "@/components/profile/EducationSection";

type Params = Promise<{ handle: string }>;

// The page itself only lays things out. Data loading happens inside <Suspense> (same pattern as Feed).
export default function ProfilePage({ params }: { params: Params }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <Suspense fallback={<ProfileSkeleton />}>
        <Profile params={params} />
      </Suspense>
      <RightSidebar />
    </div>
  );
}

async function Profile({ params }: { params: Params }) {
  const { handle } = await params; // e.g. "sophie-t" from /in/sophie-t
  const supabase = createClient(await cookies());

  // 1. The profile, looked up by handle
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle)
    .maybeSingle();

  if (!profile) notFound(); // unknown handle → 404 page

  // 2. Their experience (Person 2's view already includes the title)
  const { data: experience } = await supabase
    .from("experience")
    .select("*")
    .eq("user_id", profile.id)
    .order("count", { ascending: false });

  return (
    <div className="space-y-2">
      <ProfileHeader profile={profile} />
      <ExperienceSection items={experience ?? []} />
      <EducationSection profile={profile} />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-[380px] animate-pulse rounded-lg border bg-card" />
      <div className="h-[240px] animate-pulse rounded-lg border bg-card" />
    </div>
  );
}