import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser, getProfile } from "@/lib/data";
import { signInAs } from "@/app/actions";
import { DEMO_ACCOUNTS } from "@/lib/demo";
import Avatar from "@/components/Avatar";
import AuraToken from "@/components/AuraToken";

// Static shell; the card inside depends on who's signed in, so it streams in
export default function LeftSidebar() {
  return (
    <aside className="hidden space-y-2 md:block">
      <Suspense fallback={<CardSkeleton />}>
        <ProfileCard />
      </Suspense>
    </aside>
  );
}

async function ProfileCard() {
  const me = await getCurrentUser();
  if (!me) return <SignedOutCard />;

  // Person 2's getProfile gives us the real enabler count and experience
  const data = await getProfile(me.handle);
  const enablers = data?.enablerCount ?? 0;
  const topJob = data?.experience[0]; // sorted by visit count, so this is their "main job"
  const profileHref = `/in/${me.handle}`;

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      {/* Banner */}
      {me.banner_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={me.banner_url} alt="" className="h-14 w-full object-cover" />
      ) : (
        <div className="h-14 bg-linear-to-r from-[var(--banner-from)] to-[var(--banner-to)]" />
      )}

      {/* Avatar overlapping the banner, name, headline, current "job" */}
      <div className="px-4 pb-4">
        <Link href={profileHref} className="-mt-9 block w-fit rounded-full border-2 border-white">
          <Avatar name={me.full_name} url={me.avatar_url} size={72} />
        </Link>
        <Link href={profileHref} className="mt-3 block text-lg font-semibold hover:underline">
          {me.full_name}
        </Link>
        {me.headline && <p className="text-xs text-muted-foreground">{me.headline}</p>}
        {topJob?.name && (
          <p className="mt-1 text-xs text-muted-foreground">
            {topJob.title} at {topJob.name}
          </p>
        )}
      </div>

      {/* Stats: one real, one joke */}
      <div className="border-t py-2 text-xs font-semibold">
        <Link href="/network" className="flex justify-between px-4 py-1 hover:bg-accent">
          <span className="text-muted-foreground">Enablers</span>
          <span className="text-primary">{enablers}</span>
        </Link>
        <div className="flex justify-between px-4 py-1">
          <span className="text-muted-foreground">Aura Points</span>
          <span className="flex items-center gap-1 text-primary">
            <AuraToken size={14} />
            {(data?.aura ?? 0).toLocaleString("en-US")}
          </span>
        </div>
      </div>

      {/* Premium upsell parody */}
      <div className="border-t px-4 py-3 text-xs">
        <p className="text-muted-foreground">Unlock your academic potential</p>
        <p className="mt-1 flex items-center gap-1 font-semibold">
          <span className="inline-block h-3 w-3 rounded-sm bg-[#E7A33E]" />
          Reactivate your GPA with Premium
        </p>
      </div>

    </div>
  );
}

// Shown when nobody is signed in: one-click demo logins (great for judges opening the link)
function SignedOutCard() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-base font-semibold">Welcome to LockedOut</p>
      <p className="mt-1 text-xs text-muted-foreground">
        The professional network for unprofessional students.
      </p>

      <p className="mt-4 text-xs font-semibold text-muted-foreground">Try it as</p>
      <div className="mt-1 space-y-1">
        {DEMO_ACCOUNTS.map((a) => (
          <form key={a.handle} action={signInAs.bind(null, a.handle)}>
            <button className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent">
              <Avatar name={a.name} size={28} />
              <span className="font-semibold">{a.name}</span>
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}

function CardSkeleton() {
  return <div className="h-[300px] animate-pulse rounded-lg border bg-card" />;
}