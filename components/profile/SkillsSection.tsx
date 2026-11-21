"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import type { getProfile } from "@/lib/data";
import Section from "@/components/profile/Section";
import AddSkillDialog from "@/components/profile/AddSkillDialog";
import EndorseButton from "@/components/profile/EndorseButton";
import ConnectButton from "@/components/ConnectButton";

type ProfileData = NonNullable<Awaited<ReturnType<typeof getProfile>>>;
type Skill = ProfileData["skills"][number]; // { id, name, endorsements, endorsedByMe }
type Connection = ProfileData["connection"]; // "self" | "accepted" | "pending" | "none"

const VISIBLE = 3; // LinkedIn shows the top few, the rest behind "Show all"

type Props = {
  skills: Skill[]; // already sorted by endorsements (most first) by getProfile
  connection: Connection; // viewer ↔ profile owner
  signedIn: boolean;
  ownerId: string; // for the Connect button
  ownerFirstName: string;
};

export default function SkillsSection({ skills, connection, signedIn, ownerId, ownerFirstName }: Props) {
  const [showAll, setShowAll] = useState(false);

  const isMe = connection === "self";
  const canEndorse = signedIn && connection === "accepted"; // the database only allows enablers

  const visible = showAll ? skills : skills.slice(0, VISIBLE);
  const hiddenCount = skills.length - VISIBLE;

  return (
    <Section
      title="Skills"
      action={isMe ? <AddSkillDialog existing={skills.map((s) => s.name)} /> : undefined}
    >
      {/* Why you can't endorse (only on other people's profiles, when signed in) */}
      {signedIn && connection === "none" && skills.length > 0 && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3 text-sm">
          <span>Connect with {ownerFirstName} to endorse their skills.</span>
          <ConnectButton userId={ownerId} mode="connect" />
        </div>
      )}
      {signedIn && connection === "pending" && (
        <p className="mb-3 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          Your enabler request with {ownerFirstName} is pending. Endorsing unlocks once it&apos;s accepted.
        </p>
      )}

      {skills.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {isMe ? "No skills yet. Add your worst habits." : "No skills listed. Suspiciously well-adjusted."}
        </p>
      )}

      <ul className="divide-y">
        {visible.map((skill) => (
          <li key={skill.id} className="py-3 first:pt-0">
            <p className="text-sm font-semibold">{skill.name}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-4 w-4" />
              {skill.endorsements === 0
                ? "No endorsements yet"
                : `${skill.endorsements} ${skill.endorsements === 1 ? "endorsement" : "endorsements"}`}
            </p>
            {canEndorse && (
              <EndorseButton
                skillId={skill.id}
                alreadyEndorsed={skill.endorsedByMe}
                ownerFirstName={ownerFirstName}
              />
            )}
          </li>
        ))}
      </ul>

      {/* Full-width footer button, like LinkedIn's "Show all" */}
      {hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="-mx-6 -mb-5 mt-2 block w-[calc(100%+3rem)] rounded-b-lg border-t py-3 text-center text-sm font-semibold text-muted-foreground hover:bg-accent"
        >
          {showAll ? "Show less ↑" : `Show all ${skills.length} skills →`}
        </button>
      )}
    </Section>
  );
}
