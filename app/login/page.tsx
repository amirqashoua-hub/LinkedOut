import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

// Real accounts sign in here. Demo accounts can still be picked from the Me menu.
export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm rounded-lg border bg-card p-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">Welcome back. Your regrets missed you.</p>
      <LoginForm />
      <p className="mt-6 text-center text-xs text-muted-foreground">
        No account? Ask whoever runs LockedOut to make you one. Just looking? Use a demo account from the Sign in menu.
      </p>
    </div>
  );
}
