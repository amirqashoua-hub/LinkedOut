"use client";

import { useState } from "react";
import ReactionBar from "@/components/ReactionBar";
import CommentsSection, { type ShownComment } from "@/components/comments/CommentsSection";
import type { ReactionCounts, ReactionKey } from "@/lib/reactions";

type Props = {
  postId: string;
  reactionCounts: ReactionCounts;
  myReaction: ReactionKey | null;
  comments: ShownComment[];
  meId: string | null;
  myName: string | null;
  myAvatar: string | null;
  defaultOpen?: boolean; // the post's own page opens comments straight away
};

// Reactions + comments under a post. Holds "are comments open?" here, so it stays open
// when the ReactionBar restarts after a reaction (it's keyed by the server's counts).
export default function PostEngagement({
  postId,
  reactionCounts,
  myReaction,
  comments,
  meId,
  myName,
  myAvatar,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <>
      <ReactionBar
        // reset when the viewer's reaction or the counts change on the server (e.g. switching accounts)
        key={`${postId}:${myReaction ?? "-"}:${JSON.stringify(reactionCounts)}`}
        postId={postId}
        initialCounts={reactionCounts}
        initialMine={myReaction}
        commentCount={comments.length}
        onComment={() => setOpen((o) => !o)}
      />
      {open && (
        <CommentsSection postId={postId} comments={comments} meId={meId} myName={myName} myAvatar={myAvatar} />
      )}
    </>
  );
}
