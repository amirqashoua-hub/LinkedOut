import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/components/TopNav";

// Absolute links in link previews (og:url, og:image) need the site's address.
// Vercel sets VERCEL_PROJECT_PRODUCTION_URL automatically.
const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Pages set their own title, e.g. "Events" → "Events | LockedOut"
  title: { default: "LockedOut", template: "%s | LockedOut" },
  description: "The professional network for unprofessional students",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full overflow-x-clip bg-background">
        <TopNav />
        <main className="mx-auto max-w-[1128px] px-3 py-4 sm:px-4 sm:py-6">{children}</main>
      </body>
    </html>
  );
}