import type { Tables } from "@/lib/database.types";
import Section from "@/components/profile/Section";
import PlusOneButton from "@/components/profile/PlusOneButton";

const TYPE_LABEL = { drinking_week: "Drinking Week", bar: "Bar", club: "Club" } as const;
const TYPE_COLOR = { drinking_week: "bg-[#E7A33E]", bar: "bg-[#5F9B41]", club: "bg-[#8F5849]" } as const;

// "2024-09-03" → "Sep 2024"
function monthYear(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";
}

type Props = {
  items: (Tables<"experience"> & { logo_url?: string | null })[];
  canLog: boolean;   // true only on your own profile → shows +1 buttons
  firstName: string; // used in the promotion toast
};

export default function ExperienceSection({ items, canLog, firstName }: Props) {
  return (
    <Section title="Experience">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No experience yet. Suspiciously responsible.</p>
      )}

      <ul className="divide-y">
        {items.map((exp) => (
          <li key={exp.place_id} className="flex gap-3 py-3 first:pt-0">
            {/* "Company logo": the place's logo if it has one, else a coloured letter tile */}
            {exp.logo_url ? (
              <img
                src={exp.logo_url}
                alt=""
                className="h-12 w-12 shrink-0 rounded border bg-white object-cover"
              />
            ) : (
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded text-lg font-bold text-white ${
                  exp.type ? TYPE_COLOR[exp.type] : "bg-muted"
                }`}
              >
                {exp.name?.[0]}
              </div>
            )}

            {/* Title, place, dates */}
            <div className="text-sm">
              <p className="font-semibold">{exp.title}</p>
              <p>
                {exp.name} · {exp.type ? TYPE_LABEL[exp.type] : ""}
              </p>
              <p className="text-muted-foreground">
                {monthYear(exp.first_visit)} – Present · {exp.count} {exp.count === 1 ? "visit" : "visits"}
              </p>
              <p className="text-muted-foreground">Montreal, Quebec · On-site</p>

              {/* Latest photo from a +1 (visits.photo_url), shown like LinkedIn's experience media */}
              {exp.photo_url && (
                <a
                  href={exp.photo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block w-fit"
                  title="Open full photo"
                >
                  <img
                    src={exp.photo_url}
                    alt={`Evidence from ${exp.name}`}
                    className="h-20 w-32 rounded border object-cover hover:opacity-90"
                  />
                  <span className="mt-1 block text-xs text-muted-foreground">📸 Latest evidence</span>
                </a>
              )}
            </div>

            {/* +1 button, only on your own profile */}
            {canLog && exp.place_id && exp.name && (
              <div className="ml-auto self-center">
                <PlusOneButton placeId={exp.place_id} placeName={exp.name} firstName={firstName} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}