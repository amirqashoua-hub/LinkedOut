import Link from "next/link";
import { ThumbsUp, MessageSquare, Repeat2, Send, Globe } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { REACTIONS, type ReactionCounts } from "@/lib/reactions";
import { timeAgo } from "@/lib/format";
import Avatar from "@/components/Avatar";
import SeeMoreText from "@/components/SeeMoreText";

const ACTIONS = [
  { icon: ThumbsUp, label: "Same" },
  { icon: MessageSquare, label: "Comment" },
  { icon: Repeat2, label: "Repost" },
  { icon: Send, label: "Send" },
];

export default function PostCard({ post }: { post: Tables<"feed"> }) {
  // reaction_counts comes from the database as Json, so we tell TypeScript its real shape
  const counts = (post.reaction_counts ?? {}) as ReactionCounts;
  const total = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);
  const top3 = REACTIONS.filter((r) => (counts[r.key] ?? 0) > 0)
    .sort((a, b) => (counts[b.key] ?? 0) - (counts[a.key] ?? 0))
    .slice(0, 3);
  const profileHref = `/in/${post.handle}`;

  return (
    <article className="rounded-lg border bg-card">
      {/* Author */}
      <header className="flex gap-2 px-4 pt-3">
        <Link href={profileHref}>
          <Avatar name={post.full_name} url={post.avatar_url} size={48} />
        </Link>
        <div className="min-w-0">
          <Link href={profileHref} className="text-sm font-semibold hover:text-primary hover:underline">
            {post.full_name}
          </Link>
          <p className="truncate text-xs text-muted-foreground">{post.headline}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            {timeAgo(post.created_at)} • <Globe className="h-3 w-3" />
          </p>
        </div>
        <button className="ml-auto self-start rounded px-2 py-1 text-sm font-semibold text-primary hover:bg-[#EBF4FD]">
          + Follow
        </button>
      </header>

      {/* Body */}
      <div className="mt-2">
        <SeeMoreText text={post.ai_text ?? ""} />
      </div>

      {/* Reaction summary: top 3 emoji + total */}
      {total > 0 && (
        <div className="mx-4 mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <span className="flex -space-x-1">
            {top3.map((r) => (
              <span key={r.key} title={r.label} className="text-sm">
                {r.emoji}
              </span>
            ))}
          </span>
          <span className="ml-1 cursor-pointer hover:text-primary hover:underline">{total}</span>
        </div>
      )}

      {/* Action buttons */}
      <footer className="mx-4 mt-2 grid grid-cols-4 border-t py-1">
        {ACTIONS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex items-center justify-center gap-1.5 rounded py-3 text-sm font-semibold text-muted-foreground hover:bg-accent"
          >
            <Icon className="h-5 w-5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </footer>
    </article>
  );
}