"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Users, Briefcase, MessageSquareText, Bell, Search } from "lucide-react";

// The 5 tabs. Change labels here and the nav updates.
const TABS = [
  { href: "/", label: "Home", icon: House },
  { href: "/network", label: "My Enablers", icon: Users },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/messaging", label: "Messaging", icon: MessageSquareText },
  { href: "/notifications", label: "Guilt Trips", icon: Bell, badge: 3 },
];

export default function TopNav() {
  const pathname = usePathname(); // the current URL path, e.g. "/jobs"

  return (
    <header className="sticky top-0 z-50 border-b bg-card">
      <div className="mx-auto flex h-[52px] max-w-[1128px] items-center px-4">
        {/* Logo: our own wordmark, not LinkedIn's actual logo */}
        <Link href="/" className="flex shrink-0 items-center" aria-label="LinkedOut home">
          <span className="text-[22px] font-bold text-primary">Linked</span>
          <span className="ml-0.5 rounded bg-primary px-1 text-[22px] font-bold text-primary-foreground">
            Out
          </span>
        </Link>

        {/* Search bar (decorative for the demo) */}
        <div className="relative ml-3 hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search for regrets"
            className="h-[34px] w-[280px] rounded bg-[#EDF3F8] pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Tabs */}
        <nav className="ml-auto flex h-full">
          {TABS.map(({ href, label, icon: Icon, badge }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex h-full min-w-[80px] flex-col items-center justify-center border-b-2 text-xs ${
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.25 : 1.75} />
                <span className="hidden lg:block">{label}</span>
                {badge ? (
                  <span className="absolute top-1 right-5 rounded-full bg-[#CB112D] px-1.5 text-[11px] font-semibold leading-4 text-white">
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}

          {/* "Me" → your profile */}
          <Link
            href="/in/sophie-t"
            className="flex h-full min-w-[80px] flex-col items-center justify-center border-l text-xs text-muted-foreground hover:text-foreground"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              ST
            </span>
            <span className="hidden lg:block">Me ▾</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}