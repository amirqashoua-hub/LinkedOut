import type { Metadata } from "next";
import MessagingInbox from "@/components/MessagingInbox";
import RightSidebar from "@/components/RightSidebar";

export const metadata: Metadata = { title: "Messaging" };

// Joke page: static fake inbox, no database. Keeps the Messaging tab and "Message" buttons from 404ing.
export default function MessagingPage() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <MessagingInbox />
      <RightSidebar />
    </div>
  );
}
