import Link from "next/link";
import { Suspense } from "react";
import { Search } from "lucide-react";
import NavTabs, { Tabs } from "@/components/NavTabs";
import MeMenu, { MeMenuSkeleton } from "@/components/MeMenu";

// Server component now: only NavTabs (needs the URL) and MeMenu (needs cookies) are dynamic
export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b bg-card">
      <div className="mx-auto flex h-[52px] max-w-[1128px] items-center px-4">
        <Link href="/" className="flex shrink-0 items-center" aria-label="LinkedOut home">
          <span className="text-[22px] font-bold text-primary">Linked</span>
          <span className="ml-0.5 rounded bg-primary px-1 text-[22px] font-bold text-primary-foreground">
            Out
          </span>
        </Link>

        <div className="relative ml-3 hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search for regrets"
            className="h-[34px] w-[280px] rounded bg-[#EDF3F8] pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <nav className="ml-auto flex h-full">
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