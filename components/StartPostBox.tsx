import { Suspense } from "react";
import { UserRound } from "lucide-react";
import { getCurrentUser } from "@/lib/data";
import Avatar from "@/components/Avatar";
import PostComposer from "@/components/PostComposer";

// The signed-in user's avatar (needs the login cookie, so it's wrapped in Suspense below)
async function MyAvatar() {
  const me = await getCurrentUser();
  if (!me) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <UserRound className="h-6 w-6" />
      </div>
    );
  }
  return <Avatar name={me.full_name} url={me.avatar_url} size={48} />;
}

export default function StartPostBox() {
  return (
    <div className="rounded-lg border bg-card px-4 pt-3 pb-1">
      <div className="flex gap-2">
        <Suspense fallback={<div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-muted" />}>
          <MyAvatar />
        </Suspense>
        {/* The "Start a post…" button + modal live in PostComposer (client component) */}
        <PostComposer />
      </div>
      <div className="mt-1 flex justify-around">
        {/* "Post a photo" picks a photo, then opens the composer with it attached */}
        <PostComposer variant="evidence" />
        {/* "Write anonymous confession" opens the composer in anonymous mode */}
        <PostComposer variant="confession" />
      </div>
    </div>
  );
}