import { Suspense } from "react";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import StartPostBox from "@/components/StartPostBox";
import Feed, { FeedSkeleton } from "@/components/Feed";
import OddsCard, { OddsCardSkeleton } from "@/components/odds/OddsCard";

export default function Home() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[225px_minmax(0,1fr)] lg:grid-cols-[225px_minmax(0,1fr)_300px]">
      <LeftSidebar />

      <section className="space-y-2">
        <StartPostBox />
        {/* the right column is hidden below laptop width, so Odds shows here instead */}
        <div className="lg:hidden">
          <Suspense fallback={<OddsCardSkeleton />}>
            <OddsCard />
          </Suspense>
        </div>
        <Suspense fallback={<FeedSkeleton />}>
          <Feed />
        </Suspense>
      </section>

      <RightSidebar />
    </div>
  );
}