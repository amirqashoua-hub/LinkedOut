import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPost, getCurrentUser } from "@/lib/data";
import PostCard from "@/components/PostCard";
import RightSidebar from "@/components/RightSidebar";
import { FeedSkeleton } from "@/components/Feed";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  return { title: !post ? "Post not found" : post.is_anonymous ? "Anonymous confession" : `${post.full_name}'s post` };
}

// One post on its own page (opened from a profile's Activity), like LinkedIn's post view
export default function PostPage({ params }: { params: Params }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-2">
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to feed
        </Link>
        <Suspense fallback={<FeedSkeleton />}>
          <PostContent params={params} />
        </Suspense>
      </div>
      <RightSidebar />
    </div>
  );
}

async function PostContent({ params }: { params: Params }) {
  const { id } = await params;
  const [post, me] = await Promise.all([getPost(id), getCurrentUser()]);
  if (!post) notFound();

  return (
    <>
      <PostCard post={post} isMine={post.is_mine ?? (!!me && post.author_id === me.id)} />
      {post.handle && (
        <Link href={`/in/${post.handle}`} className="block text-center text-sm font-semibold text-primary hover:underline">
          See more from {(post.full_name ?? "them").split(" ")[0]} →
        </Link>
      )}
    </>
  );
}
