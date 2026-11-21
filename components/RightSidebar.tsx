import { Suspense, type ReactNode } from "react";
import OddsCard, { OddsCardSkeleton } from "@/components/odds/OddsCard";

const NEWS = [
  { title: "Gerts reports record Thursday turnout", meta: "2h ago • 4,312 readers" },
  { title: "MATH 240 average hits new low", meta: "5h ago • 2,108 readers" },
  { title: "Redpath silent floor not silent, sources say", meta: "1d ago • 1,877 readers" },
  { title: "Frosh enters its third straight month", meta: "1d ago • 950 readers" },
  { title: "U3 student discovers office hours exist", meta: "2d ago • 611 readers" },
];

// News + LockedOut Odds on every page that has the right column.
// children: optional extra cards under them
export default function RightSidebar({ children }: { children?: ReactNode }) {
  return (
    <aside className="hidden space-y-2 lg:block">
      <div className="rounded-lg border bg-card py-3">
        <h2 className="px-4 text-base font-semibold">LockedOut News</h2>
        <p className="px-4 pt-2 text-sm font-semibold text-muted-foreground">Top stories</p>
        <ul className="mt-1">
          {NEWS.map((item) => (
            <li key={item.title} className="cursor-pointer px-4 py-1.5 hover:bg-accent">
              <p className="truncate text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.meta}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Odds load per visitor (your own picks), so they stream in */}
      <Suspense fallback={<OddsCardSkeleton />}>
        <OddsCard />
      </Suspense>

      {children}

      <p className="px-4 text-center text-xs text-muted-foreground">
        About · Accessibility · Help Center · Privacy &amp; Terms
        <br />
        <span className="font-semibold text-primary">Locked</span>
        <span className="font-semibold">Out</span> Corporation © 2026
      </p>
    </aside>
  );
}