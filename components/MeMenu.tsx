import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { getCurrentUser, getAvatarsByHandle } from "@/lib/data";
import { signInAs, signOut } from "@/app/actions";
import { DEMO_ACCOUNTS } from "@/lib/demo";
import Avatar from "@/components/Avatar";
import Dropdown from "@/components/Dropdown";

// List of demo accounts you can switch to (everyone except the current one)
async function AccountList({ currentHandle }: { currentHandle?: string }) {
  const avatars = await getAvatarsByHandle(DEMO_ACCOUNTS.map((a) => a.handle)).catch(() => ({}) as Record<string, string | null>);
  return (
    <div className="py-1">
      <p className="px-4 py-1 text-xs font-semibold text-muted-foreground">
        {currentHandle ? "Switch account" : "Sign in as"}
      </p>
      {DEMO_ACCOUNTS.filter((a) => a.handle !== currentHandle).map((a) => (
        // .bind(null, a.handle) = "call signInAs with this handle when the form submits"
        <form key={a.handle} action={signInAs.bind(null, a.handle)}>
          <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-accent">
            <Avatar name={a.name} url={avatars[a.handle]} size={28} />
            <span>
              <span className="block font-semibold">{a.name}</span>
              <span className="block text-xs text-muted-foreground">{a.tagline}</span>
            </span>
          </button>
        </form>
      ))}
    </div>
  );
}

// Runs on the server: knows who is logged in, builds the menu, hands it to the client Dropdown
export default async function MeMenu() {
  const me = await getCurrentUser();

  const trigger = me ? (
    <span className="flex min-w-[48px] md:min-w-[80px] flex-col items-center justify-center text-xs text-muted-foreground hover:text-foreground">
      <Avatar name={me.full_name} url={me.avatar_url} size={24} />
      <span className="hidden items-center lg:flex">
        Me <ChevronDown className="h-3 w-3" />
      </span>
    </span>
  ) : (
    <span className="mx-1 flex items-center gap-1 rounded-full border border-primary px-3 py-1 md:mx-3 md:px-4 text-sm font-semibold text-primary hover:bg-brand-tint">
      Sign in <ChevronDown className="h-4 w-4" />
    </span>
  );

  return (
    <Dropdown trigger={trigger}>
      {me && (
        <div className="border-b p-4">
          <div className="flex gap-2">
            <Avatar name={me.full_name} url={me.avatar_url} size={48} />
            <div className="min-w-0">
              <p className="font-semibold">{me.full_name}</p>
              <p className="truncate text-xs text-muted-foreground">{me.headline}</p>
            </div>
          </div>
          <Link
            href={`/in/${me.handle}`}
            className="mt-3 block rounded-full border border-primary py-1 text-center text-sm font-semibold text-primary hover:bg-brand-tint"
          >
            View profile
          </Link>
        </div>
      )}

      {/* Real accounts (friends' logins) sign in with email + password */}
      {!me && (
        <div className="flex border-b text-sm font-semibold">
          <Link href="/login" className="flex-1 px-4 py-3 text-primary hover:bg-accent">
            Sign in with email
          </Link>
          <Link href="/join" className="flex-1 border-l px-4 py-3 text-center text-primary hover:bg-accent">
            Join
          </Link>
        </div>
      )}

      <AccountList currentHandle={me?.handle} />

      {me && (
        <form action={signOut} className="border-t">
          <button className="w-full px-4 py-2 text-left text-sm text-muted-foreground hover:bg-accent">
            Sign out
          </button>
        </form>
      )}
    </Dropdown>
  );
}

export function MeMenuSkeleton() {
  return (
    <div className="flex h-full min-w-[48px] md:min-w-[80px] items-center justify-center">
      <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
    </div>
  );
}