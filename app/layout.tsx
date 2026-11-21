import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/components/TopNav";

export const metadata: Metadata = {
  // Pages set their own title, e.g. "Jobs" → "Jobs | LockedOut"
  title: { default: "LockedOut", template: "%s | LockedOut" },
  description: "The professional network for unprofessional students",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background">
        <TopNav />
        <main className="mx-auto max-w-[1128px] px-4 py-6">{children}</main>
      </body>
    </html>
  );
}