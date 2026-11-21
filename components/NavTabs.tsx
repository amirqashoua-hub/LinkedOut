"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Users, CalendarDays, Bell } from "lucide-react";

const TABS = [
  { href: "/", label: "Home", icon: House },
  { href: "/network", label: "My Enablers", icon: Users },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/notifications", label: "Guilt Trips", icon: Bell, showsBadge: true },
];

type Props = { guiltTrips?: number }; // real count from the server (TopNav)

// Reads the current URL (client-only) and passes it down
export default function NavTabs({ guiltTrips = 0 }: Props) {
  const pathname = usePathname();
  return <Tabs pathname={pathname} guiltTrips={guiltTrips} />;
}

// The tabs themselves. pathname = null → nothing underlined (used as the loading fallback)
export function Tabs({ pathname, guiltTrips = 0 }: { pathname: string | null; guiltTrips?: number }) {
  return (
    <>
      {TABS.map(({ href, label, icon: Icon, showsBadge }) => {
        const active =
          pathname !== null && (href === "/" ? pathname === "/" : pathname.startsWith(href));

        // Real count; hidden when 0 or when you're already looking at that page
        const badge =
          showsBadge && guiltTrips > 0 && !active ? (guiltTrips > 99 ? "99+" : String(guiltTrips)) : null;

        return (
          <Link
            key={href}
            href={href}
            className={`relative flex h-full min-w-0 flex-1 flex-col items-center justify-center border-b-2 text-xs md:min-w-[80px] md:flex-none ${
              active
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-6 w-6" strokeWidth={active ? 2.25 : 1.75} />
            <span className="hidden lg:block">{label}</span>
            {badge && (
              <span className="absolute top-1 left-1/2 ml-1.5 rounded-full bg-[#CB112D] px-1.5 text-[11px] font-semibold leading-4 text-white">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}