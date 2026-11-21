import Link from "next/link";
import { Globe } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import type { ReactionCounts, ReactionKey } from "@/lib/reactions";
import { timeAgo } from "@/lib/format";
import Avatar from "@/components/Avatar";
import SeeMoreText from "@/components/SeeMoreText";
import ReactionBar from "@/components/ReactionBar";

export default function PostCard({ post }: { post: Tables<"feed"> }) {
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

      {/* Reactions summary + action buttons (client component) */}
      {post.id && (
        <ReactionBar
          postId={post.id}
          initialCounts={(post.reaction_counts ?? {}) as ReactionCounts}
          initialMine={post.my_reaction as ReactionKey | null}
        />
      )}
    </article>
  );
}