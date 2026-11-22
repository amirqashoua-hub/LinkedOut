import Link from "next/link";
import { Suspense } from "react";
import NavTabs, { Tabs } from "@/components/NavTabs";
import MeMenu, { MeMenuSkeleton } from "@/components/MeMenu";
import SearchEnablers from "@/components/SearchEnablers";

// Server component now: only NavTabs (needs the URL) and MeMenu (needs cookies) are dynamic
export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b bg-card">
      <div className="mx-auto flex h-[52px] max-w-[1128px] items-center px-2 sm:px-4">
        <Link href="/" className="flex shrink-0 flex-col justify-center" aria-label="LockedOut home">
          <span className="flex items-center leading-none">
            {/* phones show just the "Out" tile, like LinkedIn's "in" */}
            <span className="hidden text-[22px] font-bold text-primary sm:inline">Locked</span>
            <span className="rounded bg-primary px-1 text-[22px] font-bold text-primary-foreground sm:ml-0.5">
              Out
            </span>
          </span>
          {/* tagline under the logo (laptop and up; no room in the phone/tablet bar) */}
          <span className="mt-0.5 hidden text-[10px] leading-tight font-semibold whitespace-nowrap text-muted-foreground lg:block">
            The Anti-LinkedIn: undo your stress
          </span>
        </Link>

        {/* type a name → matching profiles (desktop; phones have no room for it) */}
        <SearchEnablers />

        {/* phones: the tabs stretch to share the width; desktop: fixed-width tabs on the right */}
        <nav className="ml-1 flex h-full min-w-0 flex-1 md:ml-auto md:flex-none">
          <Suspense fallback={<Tabs pathname={null} />}>
            <NavTabs />
          </Suspense>

          <div className="flex h-full border-l">
            <Suspense fallback={<MeMenuSkeleton />}>
              <MeMenu />
            </Suspense>
          </div>
        </nav>
      </div>
    </header>
  );
}