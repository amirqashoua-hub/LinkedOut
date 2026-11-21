import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProfile } from "@/lib/data";
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
  const { handle } = await params;
  const data = await getProfile(handle);
  if (!data) notFound();

  return (
    <div className="space-y-2">
      <ProfileHeader profile={data.profile} />
      <ExperienceSection items={data.experience} />
      <EducationSection profile={data.profile} />
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