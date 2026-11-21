import Link from "next/link";
import { getCurrentUser } from "@/lib/data";
import { signInDemo, signOut } from "@/app/actions";
import Avatar from "@/components/Avatar";

// Runs on the server: shows "Sign in" or the logged-in user's avatar
export default async function MeMenu() {
  const me = await getCurrentUser();

  if (!me) {
    return (
      <form action={signInDemo} className="flex h-full items-center px-3">
        <button className="rounded-full border border-primary px-4 py-1 text-sm font-semibold text-primary hover:bg-[#EBF4FD]">
          Sign in as demo
        </button>
      </form>
    );
  }

  return (
    <div className="flex h-full items-center">
      <Link
        href={`/in/${me.handle}`}
        className="flex h-full min-w-[80px] flex-col items-center justify-center text-xs text-muted-foreground hover:text-foreground"
      >
        <Avatar name={me.full_name} url={me.avatar_url} size={24} />
        <span className="hidden lg:block">Me ▾</span>
      </Link>
      <form action={signOut}>
        <button className="px-2 text-xs text-muted-foreground hover:text-foreground hover:underline">
          Sign out
        </button>
      </form>
    </div>
  );
}

export function MeMenuSkeleton() {
  return (
    <div className="flex h-full min-w-[80px] items-center justify-center">
      <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
    </div>
  );
}