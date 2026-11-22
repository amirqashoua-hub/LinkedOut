import Link from "next/link";
import type { Tables } from "@/lib/database.types";
import { REACTIONS, type ReactionCounts } from "@/lib/reactions";
import { timeAgo } from "@/lib/format";
import { formatPostText } from "@/lib/postText";
import Section from "@/components/profile/Section";
import ShowMore from "@/components/ShowMore";
import PostMenu from "@/components/PostMenu";

type Props = {
  posts: Tables<"feed">[]; // from getProfile(): this user's posts
  firstName: string;
  isMe: boolean;
};

// Server component: builds compact post previews; ShowMore (client) handles "Show all".
// Times are computed here, once, so server and browser can't disagree (no hydration mismatch).
export default function ActivitySection({ posts, firstName, isMe }: Props) {
  // Newest first
  const sorted = [...posts].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));

  const items = sorted.map((post, i) => {
    const counts = (post.reaction_counts ?? {}) as ReactionCounts;
    const total = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);
    const top3 = REACTIONS.filter((r) => (counts[r.key] ?? 0) > 0)
      .sort((a, b) => (counts[b.key] ?? 0) - (counts[a.key] ?? 0))
      .slice(0, 3);

    return (
      <li key={post.id ?? i} className="py-3 first:pt-0">
        <div className="flex items-start">
          <p className="text-xs text-muted-foreground">
            {firstName} posted this • {timeAgo(post.created_at)}
          </p>
          {/* Your own profile: "⋯" → Delete post */}
          {isMe && post.id && <PostMenu postId={post.id} />}
        </div>
        {/* The preview opens the full post (reactions, photo, skill card) on its own page */}
        <Link href={`/posts/${post.id}`} className="-mx-2 mt-1 block rounded px-2 py-1 hover:bg-accent">
          <div className="flex gap-3">
            <p className="line-clamp-3 flex-1 whitespace-pre-line text-sm">{formatPostText(post.ai_text ?? "")}</p>
            {post.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.photo_url} alt="" className="h-16 w-16 shrink-0 rounded border object-cover" />
            )}
          </div>
          {total > 0 && (
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <span>{top3.map((r) => r.emoji).join("")}</span>
              {total}
            </p>
          )}
        </Link>
      </li>
    );
  });

  return (
    <Section title="Activity">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isMe ? (
            <>
              You haven&apos;t posted any failures yet.{" "}
              <Link href="/" className="font-semibold text-primary hover:underline">
                Start a post
              </Link>
            </>
          ) : (
            `${firstName} hasn't posted any failures yet. Suspicious.`
          )}
        </p>
      ) : (
        <ShowMore items={items} initial={2} noun="posts" />
      )}
    </Section>
  );
}
