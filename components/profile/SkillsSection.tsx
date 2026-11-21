"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import type { getProfile } from "@/lib/data";
import Section from "@/components/profile/Section";
import AddSkillDialog from "@/components/profile/AddSkillDialog";
import EndorseButton from "@/components/profile/EndorseButton";

// The skill type comes from Person 2's getProfile(): { id, name, endorsements }.
// endorsedByMe is optional, so this keeps working before and after Person 2 adds it.
type Skill = NonNullable<Awaited<ReturnType<typeof getProfile>>>["skills"][number] & {
  endorsedByMe?: boolean;
};

const VISIBLE = 3; // LinkedIn shows the top few, the rest behind "Show all"

type Props = {
  skills: Skill[]; // already sorted by endorsements (most first) by getProfile
  isMe: boolean; // your own profile → "+" add skill
  canEndorse: boolean; // signed in and looking at someone else's profile → Endorse buttons
  ownerFirstName: string;
};

export default function SkillsSection({ skills, isMe, canEndorse, ownerFirstName }: Props) {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? skills : skills.slice(0, VISIBLE);
  const hiddenCount = skills.length - VISIBLE;

  return (
    <Section
      title="Skills"
      action={isMe ? <AddSkillDialog existing={skills.map((s) => s.name)} /> : undefined}
    >
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
                alreadyEndorsed={skill.endorsedByMe ?? false}
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