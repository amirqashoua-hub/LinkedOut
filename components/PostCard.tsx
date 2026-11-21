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
        <button className="ml-auto self-start rounded px-2 py-1 text-sm font-semibold text-primary hover:bg-brand-tint">
          + Follow
        </button>
      </header>

      {/* Body */}
      <div className="mt-2">
        <SeeMoreText text={post.ai_text ?? ""} />
      </div>

      {/* Photo evidence, full width like a LinkedIn post image; click to open full size */}
      {post.photo_url && (
        <a href={post.photo_url} target="_blank" rel="noopener noreferrer" className="mt-3 block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.photo_url} alt="Photo evidence" className="max-h-[480px] w-full bg-muted object-cover" />
        </a>
      )}

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