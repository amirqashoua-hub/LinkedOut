import Link from "next/link";
import { BAR_ADS } from "@/lib/ads";

// LinkedIn-style "Promoted" cards for upcoming student bars (posters from lib/ads.ts)
export default function BarAds() {
  if (BAR_ADS.length === 0) return null;

  return (
    <>
      {BAR_ADS.map((ad) => (
        <div key={ad.image} className="overflow-hidden rounded-lg border bg-card">
          <p className="flex items-center justify-between px-3 pt-2 pb-1 text-[11px] text-muted-foreground">
            <span>Promoted</span>
            <span title="Ads keep LockedOut free. Your liver pays the rest.">Ad ⓘ</span>
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ad.image} alt={`${ad.title} poster`} loading="lazy" className="w-full border-y object-cover" />
          <div className="space-y-1 px-3 py-3 text-xs">
            <p className="text-sm font-semibold leading-snug">{ad.title}</p>
            <p className="text-muted-foreground">
              {ad.venue}
              {ad.date && ` · ${ad.date}`}
            </p>
            <p>{ad.blurb}</p>
            <Link
              href="/events"
              className="mt-2 block rounded-full border border-primary py-1 text-center text-sm font-semibold text-primary hover:bg-brand-tint"
            >
              Easy Apply
            </Link>
          </div>
        </div>
      ))}
    </>
  );
}
