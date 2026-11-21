import Link from "next/link";
import type { Tables } from "@/lib/database.types";
import Section from "@/components/profile/Section";
import PlusOneButton from "@/components/profile/PlusOneButton";
import VisitPhoto from "@/components/profile/VisitPhoto";

const TYPE_LABEL = { drinking_week: "Drinking Week", bar: "Bar", club: "Club" } as const;
const TYPE_COLOR = { drinking_week: "bg-[#E7A33E]", bar: "bg-[#5F9B41]", club: "bg-[#8F5849]" } as const;

type Props = {
  items: (Tables<"experience"> & {
    logo_url?: string | null;
    // your own profile only: the latest event you attended here (to review it)
    review?: { eventId: string; eventTitle: string; myRating: number | null } | null;
  })[];
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

            {/* Title and place */}
            <div className="text-sm">
              <p className="font-semibold">{exp.title}</p>
              <p>
                {exp.name} · {exp.type ? TYPE_LABEL[exp.type] : ""}
              </p>
              <p className="text-muted-foreground">Montreal, Quebec · On-site</p>

              {/* Review the latest event you went to here */}
              {exp.review && (
                <Link href={`/events/${exp.review.eventId}`} className="mt-1 inline-block text-xs font-semibold text-primary hover:underline">
                  {exp.review.myRating
                    ? `You rated ${exp.review.eventTitle} ${exp.review.myRating}★ · Edit`
                    : `★ Review ${exp.review.eventTitle} →`}
                </Link>
              )}

              {/* Latest photo from a +1 (visits.photo_url); removable on your own profile */}
              {exp.photo_url && exp.place_id && (
                <VisitPhoto
                  photoUrl={exp.photo_url}
                  placeId={exp.place_id}
                  placeName={exp.name ?? "this place"}
                  canRemove={canLog}
                />
              )}
            </div>

            {/* Visit count, big like a scoreboard, then the +1 button on your own profile */}
            <div className="ml-auto flex items-center gap-4 self-center">
              <div className="text-center leading-none">
                <p className="text-3xl font-bold text-primary tabular-nums">{exp.count}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {exp.count === 1 ? "visit" : "visits"}
                </p>
              </div>
              {canLog && exp.place_id && exp.name && (
                <PlusOneButton placeId={exp.place_id} placeName={exp.name} firstName={firstName} />
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}