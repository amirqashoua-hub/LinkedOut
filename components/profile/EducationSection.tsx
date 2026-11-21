import type { Tables } from "@/lib/database.types";
import Section from "@/components/profile/Section";

// TODO: switch to profile.activities if Person 2 adds that column
const ACTIVITIES = "Crying in Redpath, Napping in the Arts lounge, Pretending to read in Schulich";

export default function EducationSection({ profile }: { profile: Tables<"profiles"> }) {
  return (
    <Section title="Education">
      <div className="flex gap-3 text-sm">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-[#ED1B2F] text-lg font-bold text-white">
          M
        </div>
        <div className="space-y-0.5">
          <p className="font-semibold">{profile.school ?? "McGill University"}</p>
          <p>{profile.program}</p>
          {profile.year && <p className="text-muted-foreground">{profile.year}</p>}
          <p className="pt-1">
            Grade: {profile.hide_grade ? "🔒 Hidden on the advice of my lawyer" : profile.worst_grade}
          </p>
          <p>Worst class: {profile.worst_class}</p>
          <p className="pt-1">Activities and societies: {ACTIVITIES}</p>
        </div>
      </div>
    </Section>
  );
}