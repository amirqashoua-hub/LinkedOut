import type { Tables } from "@/lib/database.types";
import Section from "@/components/profile/Section";
import { AddWorstClassButton, RemoveWorstClassButton } from "@/components/profile/WorstClassControls";

// TODO: switch to profile.activities if Person 2 adds that column
const ACTIVITIES = "Crying in Redpath, Napping in the Arts lounge, Pretending to read in Schulich";

type WorstClass = { id: string; course: string; grade: string | null; created_at: string };

type Props = {
  profile: Tables<"profiles">;
  classes: WorstClass[]; // from getProfile(): grades already nulled if hide_grade
  isMe: boolean; // your own profile → add / remove classes
};

// "C- (curved up from D+)" → a number where lower = worse. A+ is best, F is worst.
// Grades that aren't a letter ("Don't ask", "Pending appeal") count as the worst of all.
function gradeScore(grade: string | null): number {
  const m = /^\s*([A-F])([+-]?)/i.exec(grade ?? "");
  if (!m) return -10;
  const base = { A: 12, B: 9, C: 6, D: 3, E: 0, F: 0 }[m[1].toUpperCase() as "A"] ?? 0;
  return base + (m[2] === "+" ? 1 : m[2] === "-" ? -1 : 0);
}

export default function EducationSection({ profile, classes, isMe }: Props) {
  // Worst first (ties: the one added first)
  const sorted = [...classes].sort(
    (a, b) => gradeScore(a.grade) - gradeScore(b.grade) || a.created_at.localeCompare(b.created_at)
  );
  const canRank = !profile.hide_grade && sorted.length > 1;

  return (
    <Section title="Worst Classes" action={isMe ? <AddWorstClassButton /> : undefined}>
      {/* School line, like the school header on an Education entry */}
      <div className="mb-3 flex items-center gap-3 text-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary text-base font-bold text-primary-foreground">
          M
        </div>
        <div>
          <p className="font-semibold">{profile.school ?? "McGill University"}</p>
          <p className="text-xs text-muted-foreground">
            {[profile.program, profile.year].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isMe ? "No worst classes yet. Add the one that broke you." : "No worst classes listed. Either a genius or in denial."}
        </p>
      ) : (
        <ul className="divide-y">
          {sorted.map((c, i) => {
            const dept = c.course.split(/\s+/)[0].slice(0, 4).toUpperCase();
            const grade = profile.hide_grade ? "🔒 Hidden on the advice of my lawyer" : c.grade || "Don't ask";
            return (
              <li key={c.id} className="flex gap-3 py-3 first:pt-0">
                {/* Department tile, e.g. "MATH" */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-brand-tint text-[11px] font-bold text-primary">
                  {dept}
                </div>
                <div className="text-sm">
                  <p className="font-semibold">{c.course}</p>
                  <p className="text-muted-foreground">Grade: {grade}</p>
                  {i === 0 && (canRank || sorted.length === 1) && (
                    <p className="text-xs font-semibold text-primary">🏆 Worst of the worst</p>
                  )}
                </div>
                {isMe && c.id !== "profile" && <RemoveWorstClassButton id={c.id} course={c.course} />}
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 border-t pt-3 text-sm">
        <span className="font-semibold">Activities and societies:</span> {ACTIVITIES}
      </p>
    </Section>
  );
}
