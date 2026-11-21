import Link from "next/link";
import { Check, Clock } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import type { ConnectionStatus } from "@/lib/data";
import Avatar from "@/components/Avatar";
import { AuraAmount } from "@/components/AuraToken";
import AvatarUpload from "@/components/profile/AvatarUpload";
import ConnectButton from "@/components/ConnectButton";
import EditProfileDialog from "@/components/profile/EditProfileDialog";

type Props = {
  profile: Tables<"profiles">;
  connection: ConnectionStatus; // "self" | "accepted" | "pending" | "none"
  enablerCount: number;
  aura: number; // Aura Points from settled odds
};

// Shared button styles (LinkedIn's three button looks)
const STATUS_PILL =
  "flex items-center gap-1 rounded-full bg-muted px-4 py-1.5 text-sm font-semibold text-muted-foreground";

export default function ProfileHeader({ profile, connection, enablerCount, aura }: Props) {
  const firstName = profile.full_name.split(" ")[0];

  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      {/* Banner */}
      {profile.banner_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.banner_url} alt="" className="h-[200px] w-full object-cover" />
      ) : (
        <div className="h-[200px] bg-linear-to-r from-[var(--banner-from)] to-[var(--banner-to)]" />
      )}

      <div className="px-6 pb-6">
        {/* Big avatar overlapping the banner */}
        <div className="relative -mt-[104px] w-fit rounded-full border-4 border-white">
          <Avatar name={profile.full_name} url={profile.avatar_url} size={152} />
          {/* Your own profile: camera button to upload a new picture */}
          {connection === "self" && <AvatarUpload />}
        </div>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{profile.full_name}</h1>
            <p className="text-base">{profile.headline}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Montreal, Quebec ·{" "}
              <span className="cursor-pointer font-semibold text-primary hover:underline">Contact info</span>
            </p>
            {/* Real count; on your own profile it links to My Enablers */}
            {connection === "self" ? (
              <Link href="/network" className="mt-1 block text-sm font-semibold text-primary hover:underline">
                {enablerCount} {enablerCount === 1 ? "enabler" : "enablers"}
              </Link>
            ) : (
              <p className="mt-1 text-sm font-semibold text-primary">
                {enablerCount} {enablerCount === 1 ? "enabler" : "enablers"}
              </p>
            )}
            {/* Aura Points: won or lost on LockedOut Odds */}
            <p className="mt-1 text-sm" title="Aura Points: won or lost on LockedOut Odds">
              <AuraAmount points={aura} />
            </p>
          </div>

          {/* School badge, like LinkedIn's current-company badge */}
          <div className="flex items-start gap-2 text-sm font-semibold sm:w-56">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#ED1B2F] text-white">
              M
            </span>
            <span>{profile.school ?? "McGill University"}</span>
          </div>
        </div>

        {/* Buttons depend on who's looking */}
        <div className="mt-4 flex flex-wrap items-start gap-2">
          {connection === "self" ? (
            <>
              <EditProfileDialog profile={profile} />
            </>
          ) : (
            <>
              {connection === "accepted" && (
                <span className={STATUS_PILL}>
                  <Check className="h-4 w-4" /> Enablers
                </span>
              )}
              {connection === "pending" && (
                <span className={STATUS_PILL} title={`Waiting on you or ${firstName} to accept`}>
                  <Clock className="h-4 w-4" /> Pending
                </span>
              )}
              {connection === "none" && <ConnectButton userId={profile.id} mode="connect" />}
            </>
          )}
        </div>
      </div>
    </section>
  );
}