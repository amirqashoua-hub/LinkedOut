import Link from "next/link";
import { BAR_ADS } from "@/lib/ads";
import { getMyRsvpIds } from "@/lib/data";
import AdGoingButton from "@/components/AdGoingButton";

// LinkedIn-style "Promoted" cards for upcoming student bars (posters from lib/ads.ts).
// Each ad is a real event: poster + title open its event page, "I'm going" RSVPs to it.
export default async function BarAds() {
  if (BAR_ADS.length === 0) return null;
  const going = new Set(await getMyRsvpIds(BAR_ADS.map((a) => a.eventId)).catch(() => []));

  return (
    <>
      {BAR_ADS.map((ad) => (
        <div key={ad.eventId} className="overflow-hidden rounded-lg border bg-card">
          <p className="flex items-center justify-between px-3 pt-2 pb-1 text-[11px] text-muted-foreground">
            <span>Promoted</span>
            <span title="Ads keep LockedOut free. Your liver pays the rest.">Ad ⓘ</span>
          </p>
          <Link href={`/events/${ad.eventId}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ad.image} alt={`${ad.title} poster`} loading="lazy" className="w-full border-y object-cover hover:opacity-90" />
          </Link>
          <div className="space-y-1 px-3 py-3 text-xs">
            <Link href={`/events/${ad.eventId}`} className="block text-sm font-semibold leading-snug hover:text-primary hover:underline">
              {ad.title}
            </Link>
            <p className="text-muted-foreground">
              {ad.venue}
              {ad.date && ` · ${ad.date}`}
            </p>
            <p>{ad.blurb}</p>
            <AdGoingButton eventId={ad.eventId} initialGoing={going.has(ad.eventId)} />
          </div>
        </div>
      ))}
    </>
  );
}

// Grey placeholders while the ads (and your RSVPs) load
export function BarAdsSkeleton() {
  return (
    <>
      {BAR_ADS.map((ad) => (
        <div key={ad.eventId} className="h-[420px] animate-pulse rounded-lg border bg-card" />
      ))}
    </>
  );
}
