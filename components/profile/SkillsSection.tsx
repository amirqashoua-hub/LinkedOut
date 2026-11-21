"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Trash2 } from "lucide-react";
import { removeSkill } from "@/app/actions";
import Avatar from "@/components/Avatar";
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
  const [openSkill, setOpenSkill] = useState<string | null>(null); // whose endorser list is expanded
  const [removing, setRemoving] = useState<string | null>(null); // skill being deleted
  const [removeError, setRemoveError] = useState<{ id: string; text: string } | null>(null);

  // Your own profile: delete a skill (asks first; the list refreshes from the server afterwards)
  async function handleRemove(id: string, name: string) {
    if (!window.confirm(`Remove "${name}" from your skills?`)) return;
    setRemoveError(null);
    setRemoving(id);
    try {
      const res = await removeSkill(id);
      if (res.error) setRemoveError({ id, text: res.error });
    } catch {
      setRemoveError({ id, text: "Couldn't remove that skill" });
    } finally {
      setRemoving(null);
    }
  }

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
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold">{skill.name}</p>
              {isMe && (
                <button
                  onClick={() => handleRemove(skill.id, skill.name)}
                  disabled={removing === skill.id}
                  title="Remove skill"
                  aria-label={`Remove ${skill.name}`}
                  className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-destructive disabled:opacity-50"
                >
                  {removing === skill.id ? <span className="block h-4 w-4 text-center text-xs">…</span> : <Trash2 className="h-4 w-4" />}
                </button>
              )}
            </div>
            {removeError?.id === skill.id && <p className="text-xs text-destructive">{removeError.text}</p>}
            <Endorsers
              skill={skill}
              open={openSkill === skill.id}
              onToggle={() => setOpenSkill(openSkill === skill.id ? null : skill.id)}
            />
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

// "👥 Ella, Evan and 2 others": stacked avatars; click to see everyone who endorsed
function Endorsers({ skill, open, onToggle }: { skill: Skill; open: boolean; onToggle: () => void }) {
  const people = skill.endorsers;

  if (skill.endorsements === 0) {
    return (
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="h-4 w-4" />
        No endorsements yet
      </p>
    );
  }

  const firstNames = people.slice(0, 2).map((p) => p.full_name.split(" ")[0]);
  const others = skill.endorsements - firstNames.length;
  const summary =
    firstNames.length === 0
      ? `${skill.endorsements} ${skill.endorsements === 1 ? "endorsement" : "endorsements"}`
      : `Endorsed by ${firstNames.join(", ")}${others > 0 ? ` and ${others} other${others === 1 ? "" : "s"}` : ""}`;

  return (
    <div className="mt-1">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary hover:underline"
      >
        {/* Overlapping avatars of the first 3 endorsers */}
        <span className="flex -space-x-2">
          {people.slice(0, 3).map((p) => (
            <span key={p.handle} className="rounded-full ring-2 ring-white">
              <Avatar name={p.full_name} url={p.avatar_url} size={22} />
            </span>
          ))}
        </span>
        {summary}
      </button>

      {/* Full list */}
      {open && (
        <ul className="mt-2 space-y-1 rounded-lg border bg-muted/40 p-2">
          {people.map((p) => (
            <li key={p.handle}>
              <Link
                href={`/in/${p.handle}`}
                className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
              >
                <Avatar name={p.full_name} url={p.avatar_url} size={28} />
                <span className="font-semibold">{p.full_name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
