import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProfile, getCurrentUser } from "@/lib/data";
import RightSidebar from "@/components/RightSidebar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ExperienceSection from "@/components/profile/ExperienceSection";
import EducationSection from "@/components/profile/EducationSection";
import SkillsSection from "@/components/profile/SkillsSection";

type Params = Promise<{ handle: string }>;

// The page only lays things out. Data loading happens inside <Suspense>.
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
  const { handle } = await params; // e.g. "sophie-mcbroom" from /in/sophie-mcbroom

  // Load the profile and the logged-in user at the same time
  const [data, me] = await Promise.all([getProfile(handle), getCurrentUser()]);
  if (!data) notFound(); // unknown handle → 404

  const isMe = me?.id === data.profile.id; // your own profile → +1 buttons, add skill

  return (
    <div className="space-y-2">
      <ProfileHeader profile={data.profile} />
      <ExperienceSection
        items={data.experience}
        canLog={isMe}
        firstName={data.profile.full_name.split(" ")[0]}
      />
      <EducationSection profile={data.profile} />
      <SkillsSection
        skills={data.skills}
        isMe={isMe}
        canEndorse={me !== null && !isMe}
        ownerFirstName={data.profile.full_name.split(" ")[0]}
      />
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