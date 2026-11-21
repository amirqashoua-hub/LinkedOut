import { Suspense, type ReactNode } from "react";
import OddsCard, { OddsCardSkeleton } from "@/components/odds/OddsCard";
import BarAds from "@/components/BarAds";

// LockedOut Odds, then the "Promoted" bar ads, on every page that has the right column.
// children: optional extra cards under them
export default function RightSidebar({ children }: { children?: ReactNode }) {
  return (
    <aside className="hidden space-y-2 lg:block">
      {/* Odds load per visitor (your own picks), so they stream in */}
      <Suspense fallback={<OddsCardSkeleton />}>
        <OddsCard />
      </Suspense>

      {/* "Promoted" posters for upcoming student bars (edit lib/ads.ts) */}
      <BarAds />

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