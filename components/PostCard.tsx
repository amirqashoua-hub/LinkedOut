import Link from "next/link";
import { Globe } from "lucide-react";
import type { FeedPost } from "@/lib/data";
import type { ReactionCounts, ReactionKey } from "@/lib/reactions";
import { timeAgo } from "@/lib/format";
import Avatar from "@/components/Avatar";
import SeeMoreText from "@/components/SeeMoreText";
import ReactionBar from "@/components/ReactionBar";
import PostMenu from "@/components/PostMenu";
import EndorseButton from "@/components/profile/EndorseButton";

// isMine: your own post → "⋯" menu with Delete instead of "+ Follow"
export default function PostCard({ post, isMine = false }: { post: FeedPost; isMine?: boolean }) {
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
        {isMine && post.id ? (
          <PostMenu postId={post.id} />
        ) : (
          <button className="ml-auto self-start rounded px-2 py-1 text-sm font-semibold text-primary hover:bg-brand-tint">
            + Follow
          </button>
        )}
      </header>

      {/* Body */}
      <div className="mt-2">
        <SeeMoreText text={post.ai_text ?? ""} />
      </div>

      {/* "New skill" post: skill card with Endorse right in the feed */}
      {post.skill && post.skill_id && post.skill_name && (
        <div className="mx-4 mt-3 flex flex-wrap items-center gap-3 rounded-lg border bg-brand-tint/40 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-card text-2xl">🎯</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">New skill</p>
            <p className="text-base font-semibold">{post.skill_name}</p>
            <p className="text-xs text-muted-foreground">
              {post.skill.endorsements === 0
                ? "No endorsements yet"
                : `${post.skill.endorsements} ${post.skill.endorsements === 1 ? "endorsement" : "endorsements"}`}
            </p>
          </div>
          {post.skill.canEndorse ? (
            <EndorseButton
              key={`${post.skill_id}-${post.skill.endorsedByMe}`}
              skillId={post.skill_id}
              alreadyEndorsed={post.skill.endorsedByMe}
              ownerFirstName={(post.full_name ?? "them").split(" ")[0]}
            />
          ) : (
            !post.skill.isMine && (
              <Link href={profileHref} className="text-xs font-semibold text-primary hover:underline">
                Only enablers can endorse. Connect →
              </Link>
            )
          )}
        </div>
      )}

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