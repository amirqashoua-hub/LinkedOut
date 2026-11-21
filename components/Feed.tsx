import { getFeed } from "@/lib/data";
import PostCard from "@/components/PostCard";

export default async function Feed() {
  const posts = await getFeed();
  const newestFirst = [...posts].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));

  return (
    <>
      {newestFirst.map((post, i) => (
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