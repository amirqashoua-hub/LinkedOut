import type { Tables } from "@/lib/database.types";
import Section from "@/components/profile/Section";

// TODO: switch to profile.activities if Person 2 adds that column
const ACTIVITIES = "Crying in Redpath, Napping in the Arts lounge, Pretending to read in Schulich";

// Grades for every class after the first (we only store one real worst grade)
const OTHER_GRADES = ["Don't ask", "Pending appeal", "Emotionally: F", "Curved, still bad"];

// "MATH 240, COMP 202; ECON 208" → ["MATH 240", "COMP 202", "ECON 208"]
function parseClasses(raw: string | null): string[] {
  return (raw ?? "")
    .split(/[,;\n]/)
    .map((c) => c.trim())
    .filter(Boolean);
}

export default function EducationSection({ profile }: { profile: Tables<"profiles"> }) {
  const classes = parseClasses(profile.worst_class);
  const grade = profile.hide_grade ? "🔒 Hidden on the advice of my lawyer" : profile.worst_grade ?? "Unknown";

  return (
    <Section title="Worst Classes">
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

      {classes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No worst classes listed. Either a genius or in denial.</p>
      ) : (
        <ul className="divide-y">
          {classes.map((course, i) => {
            const dept = course.split(/\s+/)[0].slice(0, 4).toUpperCase();
            return (
              <li key={`${course}-${i}`} className="flex gap-3 py-3 first:pt-0">
                {/* Department tile, e.g. "MATH" */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-brand-tint text-[11px] font-bold text-primary">
                  {dept}
                </div>
                <div className="text-sm">
                  <p className="font-semibold">{course}</p>
                  <p className="text-muted-foreground">
                    Grade: {i === 0 ? grade : OTHER_GRADES[(i - 1) % OTHER_GRADES.length]}
                  </p>
                  {i === 0 && <p className="text-xs font-semibold text-primary">🏆 Worst of the worst</p>}
                </div>
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
