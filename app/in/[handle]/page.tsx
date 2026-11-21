import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProfile, getCurrentUser } from "@/lib/data";
import RightSidebar from "@/components/RightSidebar";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import ProfileHeader from "@/components/profile/ProfileHeader";
import AboutSection from "@/components/profile/AboutSection";
import ActivitySection from "@/components/profile/ActivitySection";
import ExperienceSection from "@/components/profile/ExperienceSection";
import EducationSection from "@/components/profile/EducationSection";
import SkillsSection from "@/components/profile/SkillsSection";

type Params = Promise<{ handle: string }>;

// Browser tab shows the person's name, e.g. "Sophie McB | LockedOut"
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { handle } = await params;
  const data = await getProfile(handle);
  return { title: data?.profile.full_name ?? "Profile not found" };
}

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

  const isMe = me?.id === data.profile.id; // your own profile → +1 buttons
  const firstName = data.profile.full_name.split(" ")[0];

  return (
    <div className="space-y-2">
      {/* Records "who judged your profile" (skips logged-out visitors and your own profile) */}
      <ProfileViewTracker profileId={data.profile.id} />
      <ProfileHeader
        profile={data.profile}
        connection={data.connection}
        enablerCount={data.enablerCount}
        aura={data.aura}
      />
      <AboutSection bio={data.profile.bio} isMe={isMe} />
      <ActivitySection posts={data.posts} firstName={firstName} isMe={isMe} />
      <ExperienceSection items={data.experience} canLog={isMe} firstName={firstName} />
      <EducationSection profile={data.profile} classes={data.worstClasses} isMe={isMe} />
      <SkillsSection
        skills={data.skills}
        connection={data.connection}
        signedIn={me !== null}
        ownerId={data.profile.id}
        ownerFirstName={firstName}
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
