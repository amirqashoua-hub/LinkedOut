import type { Metadata } from "next";
import Link from "next/link";
import JoinForm from "@/components/JoinForm";

export const metadata: Metadata = { title: "Join" };

// Anyone can make an account; afterwards they land on their new profile to fill it in
export default function JoinPage() {
  return (
    <div className="mx-auto max-w-sm rounded-lg border bg-card p-6">
      <h1 className="text-2xl font-semibold">Join LockedOut</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Make the most of your professional failures. It takes 20 seconds, which is longer than your last study session.
      </p>
      <JoinForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
