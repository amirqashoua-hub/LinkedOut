import Link from "next/link";

// Slim strip under the top nav on every page: what LockedOut is, in one line
export default function AboutBanner() {
  return (
    <div className="border-b bg-brand-tint">
      <div className="mx-auto flex max-w-[1128px] flex-wrap items-center justify-center gap-x-2 gap-y-1 px-3 py-2 text-center text-sm sm:px-4">
        <span>
          <span className="font-semibold">Tired of LinkedIn?</span> Share your flops, mishaps and unfortunate adventures
          with your friends instead.
        </span>
        <Link href="/events" className="shrink-0 font-semibold text-primary hover:underline">
          See who&apos;s going out →
        </Link>
      </div>
    </div>
  );
}
