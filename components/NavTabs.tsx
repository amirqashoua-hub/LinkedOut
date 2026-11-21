"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Users, Briefcase, MessageSquareText, Bell } from "lucide-react";

const TABS = [
  { href: "/", label: "Home", icon: House },
  { href: "/network", label: "My Enablers", icon: Users },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/messaging", label: "Messaging", icon: MessageSquareText },
  { href: "/notifications", label: "Guilt Trips", icon: Bell, badge: 3 },
];

// Reads the current URL (client-only) and passes it down
export default function NavTabs() {
  const pathname = usePathname();
  return <Tabs pathname={pathname} />;
}

// The tabs themselves. pathname = null → nothing underlined (used as the loading fallback)
export function Tabs({ pathname }: { pathname: string | null }) {
  return (
    <>
      {TABS.map(({ href, label, icon: Icon, badge }) => {
        const active =
          pathname !== null && (href === "/" ? pathname === "/" : pathname.startsWith(href));
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
    </>
  );
}