import Link from "next/link";
import type { Person } from "@/lib/social";

export default function Attendees({ people }: { people: Person[] }) {
  if (people.length === 0) return null;
  return (
    <div className="mt-3 flex items-center">
      <div className="flex -space-x-2">
        {people.map((p) => {
          const face = p.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.avatar_url}
              alt=""
              className="h-7 w-7 rounded-full border-2 border-white object-cover"
            />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-400 text-xs font-bold text-white">
              {p.name[0]}
            </span>
          );
          return p.handle ? (
            <Link key={p.id} href={`/in/${p.handle}`} title={p.name}>
              {face}
            </Link>
          ) : (
            <span key={p.id} title={p.name}>
              {face}
            </span>
          );
        })}
      </div>
    </div>
  );
}