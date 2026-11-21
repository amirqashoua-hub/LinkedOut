import type { Tables } from "@/lib/database.types";
import Avatar from "@/components/Avatar";

export default function ProfileHeader({ profile }: { profile: Tables<"profiles"> }) {
  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      {/* Banner */}
      {profile.banner_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.banner_url} alt="" className="h-[200px] w-full object-cover" />
      ) : (
        <div className="h-[200px] bg-linear-to-r from-[#A0B4B7] to-[#C9D6DF]" />
      )}

      <div className="px-6 pb-6">
        {/* Big avatar overlapping the banner */}
        <div className="-mt-[104px] w-fit rounded-full border-4 border-white">
          <Avatar name={profile.full_name} url={profile.avatar_url} size={152} />
        </div>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{profile.full_name}</h1>
            <p className="text-base">{profile.headline}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Montreal, Quebec ·{" "}
              <span className="cursor-pointer font-semibold text-primary hover:underline">Contact info</span>
            </p>
            <p className="mt-1 text-sm font-semibold text-primary">500+ enablers</p>
          </div>

          {/* School shown on the right, like LinkedIn's current-company badge */}
          <div className="flex items-start gap-2 text-sm font-semibold sm:w-56">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#ED1B2F] text-white">
              M
            </span>
            <span>{profile.school ?? "McGill University"}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-[var(--brand-dark)]">
            Open to bad decisions
          </button>
          <button className="rounded-full border border-primary px-4 py-1.5 text-sm font-semibold text-primary hover:bg-[#EBF4FD]">
            Add regret
          </button>
          <button className="rounded-full border border-[#666] px-4 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-accent">
            More
          </button>
        </div>
      </div>
    </section>
  );
}