import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEventWithReviews } from "@/lib/data";
import { timeAgo } from "@/lib/format";
import Avatar from "@/components/Avatar";
import Stars from "@/components/Stars";
import { REVIEW_CATEGORIES } from "@/lib/reviews";
import ReviewForm from "@/components/ReviewForm";
import RightSidebar from "@/components/RightSidebar";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const data = await getEventWithReviews(id);
  return { title: data ? `${data.event.title} reviews` : "Event not found" };
}

// The page only lays things out. Data loading happens inside <Suspense>.
export default function EventPage({ params }: { params: Params }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <Suspense fallback={<EventSkeleton />}>
        <EventContent params={params} />
      </Suspense>
      <RightSidebar />
    </div>
  );
}

function when(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Montreal",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

async function EventContent({ params }: { params: Params }) {
  const { id } = await params;
  const data = await getEventWithReviews(id);
  if (!data) notFound();

  const { event, reviews, avgRating, reviewCount, breakdown, categoryAverages, isPast, canReview, myReview } = data;
  const ratedCategories = categoryAverages.filter((c) => c.average !== null);
  const org = event.org ?? "McGill";

  return (
    <div className="space-y-2">
      {/* Header: the "company" card */}
      <div className="rounded-lg border bg-card p-6">
        <Link href="/events" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to events
        </Link>
        <h1 className="text-2xl font-semibold">{event.title}</h1>
        <p className="text-sm">{org}</p>
        <p className="text-sm text-muted-foreground">
          {event.location ?? "Location TBD"} · {when(event.starts_at)}
        </p>
        {event.description && <p className="mt-3 text-sm">{event.description}</p>}
      </div>

      {/* Rating summary, Glassdoor style */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold">Reviews from attendees</h2>
        <p className="text-xs text-muted-foreground">Verified attendees only. We checked. Kind of.</p>

        {reviewCount === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {isPast ? "No reviews yet. Nobody remembers enough to write one." : "No reviews yet. This event hasn't happened yet."}
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-8">
            <div className="text-center">
              <p className="text-4xl font-semibold">{avgRating?.toFixed(1)}</p>
              <Stars value={avgRating ?? 0} />
              <p className="mt-1 text-xs text-muted-foreground">
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </p>
            </div>
            <ul className="min-w-[200px] flex-1 space-y-1">
              {breakdown.map((n, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-3 text-right">{5 - i}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-[#E7A33E]" style={{ width: `${(n / reviewCount) * 100}%` }} />
                  </div>
                  <span className="w-5">{n}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sub-rating averages (Vibes, Drinks, Music, Line wait) */}
        {ratedCategories.length > 0 && (
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t pt-4 sm:grid-cols-4">
            {ratedCategories.map((c) => (
              <li key={c.key} className="text-sm">
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="flex items-center gap-1.5 font-semibold">
                  {c.average?.toFixed(1)}
                  <Stars value={c.average ?? 0} size={12} />
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Write a review: only for people who said they attended */}
      {isPast && (
        <div className="rounded-lg border bg-card p-6">
          {canReview ? (
            <ReviewForm
              eventId={event.id}
              existing={
                myReview
                  ? {
                      rating: myReview.rating,
                      body: myReview.body,
                      vibes: myReview.vibes,
                      drinks: myReview.drinks,
                      music: myReview.music,
                      line_wait: myReview.line_wait,
                    }
                  : null
              }
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Only verified attendees can review. Went? Confirm it under{" "}
              <Link href="/events" className="font-semibold text-primary hover:underline">
                Needs your attention
              </Link>{" "}
              on Events.
            </p>
          )}
        </div>
      )}

      {/* The reviews */}
      {reviews.length > 0 && (
        <ul className="divide-y rounded-lg border bg-card">
          {reviews.map((r) => (
            <li key={r.user_id} className="flex gap-3 p-4">
              <Link href={`/in/${r.profiles?.handle}`}>
                <Avatar name={r.profiles?.full_name ?? null} url={r.profiles?.avatar_url} size={48} />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <Link href={`/in/${r.profiles?.handle}`} className="text-sm font-semibold hover:underline">
                    {r.profiles?.full_name}
                  </Link>
                  <span className="text-xs text-muted-foreground">{timeAgo(r.created_at)}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{r.profiles?.headline}</p>
                <div className="mt-1">
                  <Stars value={r.rating} size={14} />
                </div>
                {/* this reviewer's sub-ratings, e.g. "Vibes 5 · Drinks 2" */}
                {REVIEW_CATEGORIES.some((c) => r[c.key]) && (
                  <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                    {REVIEW_CATEGORIES.filter((c) => r[c.key]).map((c) => (
                      <span key={c.key}>
                        {c.label} <span className="font-semibold text-foreground">{r[c.key]}</span>★
                      </span>
                    ))}
                  </p>
                )}
                {r.body && <p className="mt-1 whitespace-pre-line text-sm">{r.body}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EventSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-[160px] animate-pulse rounded-lg border bg-card" />
      <div className="h-[180px] animate-pulse rounded-lg border bg-card" />
      <div className="h-[300px] animate-pulse rounded-lg border bg-card" />
    </div>
  );
}
