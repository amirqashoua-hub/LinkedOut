import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import PostCard from "@/components/PostCard";

// Loads posts from Supabase. Must be wrapped in <Suspense> because it reads cookies.
export default async function Feed() {
  const supabase = createClient(await cookies());
  const { data: posts, error } = await supabase
    .from("feed")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="rounded-lg border bg-card p-4 text-sm">❌ Couldn&apos;t load feed: {error.message}</div>;
  }

  return (
    <>
      {posts.map((post, i) => (
        <PostCard key={post.id ?? i} post={post} />
      ))}
    </>
  );
}

// Grey placeholder cards shown for a moment while the feed loads
export function FeedSkeleton() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-lg border bg-card p-4">
          <div className="flex gap-2">
            <div className="h-12 w-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-1/3 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 rounded bg-muted" />
            <div className="h-3 w-5/6 rounded bg-muted" />
          </div>
        </div>
      ))}
    </>
  );
}