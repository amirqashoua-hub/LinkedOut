import { Suspense } from "react";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import StartPostBox from "@/components/StartPostBox";
import Feed, { FeedSkeleton } from "@/components/Feed";
import OddsCard, { OddsCardSkeleton } from "@/components/odds/OddsCard";
import AuraLeaderboard, {
  AuraLeaderboardSkeleton,
} from "@/components/AuraLeaderboard";
import IntroSplash from "@/components/IntroSplash";
import UndoStressCard from "@/components/UndoStressCard";

export default function Home() {
  return (
    <>
      {/* "LinkedIn" start screen with one Undo button (once per session; /?intro shows it again) */}
      <IntroSplash />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[225px_minmax(0,1fr)] lg:grid-cols-[225px_minmax(0,1fr)_300px]">
        <LeftSidebar />

        <section className="space-y-2">
          {/* "Tired of LinkedIn?" Undo the internship stress */}
          <UndoStressCard />
          <StartPostBox />
          {/* the right column is hidden below laptop width, so Odds + leaderboard show here instead */}
          <div className="space-y-2 lg:hidden">
            <Suspense fallback={<OddsCardSkeleton />}>
              <OddsCard />
            </Suspense>
            <Suspense fallback={<AuraLeaderboardSkeleton />}>
              <AuraLeaderboard />
            </Suspense>
          </div>
          <Suspense fallback={<FeedSkeleton />}>
            <Feed />
          </Suspense>
        </section>

        <RightSidebar />
      </div>
    </>
  );
}
