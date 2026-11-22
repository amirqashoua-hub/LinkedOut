import Link from "next/link";
import { Globe } from "lucide-react";
import type { FeedPost, PostComment } from "@/lib/data";
import type { ReactionCounts, ReactionKey } from "@/lib/reactions";
import { timeAgo } from "@/lib/format";
import Avatar from "@/components/Avatar";
import SeeMoreText from "@/components/SeeMoreText";
import PostEngagement from "@/components/comments/PostEngagement";
import PostMenu from "@/components/PostMenu";
import EndorseButton from "@/components/profile/EndorseButton";
import ConnectButton from "@/components/ConnectButton";

type Viewer = { id: string; full_name: string; avatar_url: string | null } | null;

type Props = {
  post: FeedPost;
  isMine?: boolean; // your own post → "⋯" menu with Delete
  comments?: PostComment[]; // this post's comments (oldest first)
  viewer?: Viewer; // who's looking (for the comment box and Delete on your comments)
  commentsOpen?: boolean; // open comments straight away (the post's own page)
};

export default function PostCard({ post, isMine = false, comments = [], viewer = null, commentsOpen = false }: Props) {
  const profileHref = `/in/${post.handle}`;

  return (
    <article className="rounded-lg border bg-card">
      {/* Author (anonymous confessions show no name, photo or profile link) */}
      {post.is_anonymous ? (
        <header className="flex gap-2 px-4 pt-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-foreground text-2xl">🕵️</div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Anonymous Confessor</p>
            <p className="truncate text-xs text-muted-foreground">
              {isMine ? "This is you. Only you can see that." : "Too ashamed to sign this"}
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              {timeAgo(post.created_at)} • <Globe className="h-3 w-3" />
            </p>
          </div>
          {isMine && post.id && <PostMenu postId={post.id} />}
        </header>
      ) : (
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
          {/* your own posts: "⋯" menu with Delete */}
          {isMine && post.id && <PostMenu postId={post.id} />}

          {/* someone you're not connected to: Connect (or Accept / Pending) */}
          {!isMine && post.author_id && (
            <div className="ml-auto shrink-0 self-start">
              {post.connection === "none" && <ConnectButton userId={post.author_id} mode="connect" />}
              {post.connection === "pending_received" && <ConnectButton userId={post.author_id} mode="accept" />}
              {post.connection === "pending_sent" && (
                <span className="text-sm font-semibold text-muted-foreground">Pending</span>
              )}
            </div>
          )}
        </header>
      )}

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

      {/* Reactions, action buttons and comments (client component) */}
      {post.id && (
        <PostEngagement
          key={`${post.id}:${viewer?.id ?? "anon"}`} // fresh state after switching accounts
          postId={post.id}
          reactionCounts={(post.reaction_counts ?? {}) as ReactionCounts}
          myReaction={post.my_reaction as ReactionKey | null}
          comments={comments.map((c) => ({ ...c, ago: timeAgo(c.created_at) }))} // times worked out here, on the server
          meId={viewer?.id ?? null}
          myName={viewer?.full_name ?? null}
          myAvatar={viewer?.avatar_url ?? null}
          defaultOpen={commentsOpen}
        />
      )}
    </article>
  );
}