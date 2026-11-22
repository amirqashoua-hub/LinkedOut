import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

// Real accounts sign in here. Demo accounts can still be picked from the Me menu.
export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm rounded-lg border bg-card p-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Welcome back. Your regrets missed you.</p>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/join" className="font-semibold text-primary hover:underline">
          Join LockedOut
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">Just looking? Try a demo account from the Sign in menu.</p>
    </div>
  );
}
