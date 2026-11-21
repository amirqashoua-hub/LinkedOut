import type { Tables } from "@/lib/database.types";
import Section from "@/components/profile/Section";

const TYPE_LABEL = { drinking_week: "Drinking Week", bar: "Bar", club: "Club" } as const;
const TYPE_COLOR = { drinking_week: "bg-[#E7A33E]", bar: "bg-[#5F9B41]", club: "bg-[#8F5849]" } as const;

// "2024-09-03" → "Sep 2024"
function monthYear(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";
}

export default function ExperienceSection({ items }: { items: Tables<"experience">[] }) {
  return (
    <Section title="Experience">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No experience yet. Suspiciously responsible.</p>
      )}

      <ul className="divide-y">
        {items.map((exp) => (
          <li key={exp.place_id} className="flex gap-3 py-3 first:pt-0">
            {/* "Company logo": a coloured letter tile until places have logos */}
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded text-lg font-bold text-white ${
                exp.type ? TYPE_COLOR[exp.type] : "bg-muted"
              }`}
            >
              {exp.name?.[0]}
            </div>

            <div className="text-sm">
              <p className="font-semibold">{exp.title}</p>
              <p>
                {exp.name} · {exp.type ? TYPE_LABEL[exp.type] : ""}
              </p>
              <p className="text-muted-foreground">
                {monthYear(exp.first_visit)} – Present · {exp.count} {exp.count === 1 ? "visit" : "visits"}
              </p>
              <p className="text-muted-foreground">Montreal, Quebec · On-site</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}