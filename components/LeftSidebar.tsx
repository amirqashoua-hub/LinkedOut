import Link from "next/link";

export default function LeftSidebar() {
  return (
    <aside className="hidden space-y-2 md:block">
      <div className="overflow-hidden rounded-lg border bg-card">
        {/* Banner */}
        <div className="h-14 bg-linear-to-r from-[#A0B4B7] to-[#C9D6DF]" />

        {/* Avatar overlaps the banner (negative margin pulls it up) */}
        <div className="px-4 pb-4">
          <Link href="/in/sophie-t" className="-mt-9 block w-fit">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-white bg-primary text-2xl font-semibold text-primary-foreground">
              ST
            </div>
          </Link>
          <Link href="/in/sophie-t" className="mt-3 block text-lg font-semibold hover:underline">
            Sophie Tremblay
          </Link>
          <p className="text-xs text-muted-foreground">
            Professional Procrastinator | U2 Arts | Open to Naps
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Montreal, Quebec</p>
        </div>

        {/* Stats */}
        <div className="space-y-1 border-t px-4 py-3 text-xs font-semibold">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Profile viewers</span>
            <span className="text-primary">47</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Brain cells remaining</span>
            <span className="text-primary">3</span>
          </div>
        </div>

        {/* Premium upsell parody */}
        <div className="border-t px-4 py-3 text-xs">
          <p className="text-muted-foreground">Unlock your academic potential</p>
          <p className="mt-1 flex items-center gap-1 font-semibold">
            <span className="inline-block h-3 w-3 rounded-sm bg-[#E7A33E]" />
            Reactivate your GPA with Premium
          </p>
        </div>

        <div className="border-t px-4 py-3 text-xs font-semibold">🔖 Saved regrets</div>
      </div>
    </aside>
  );
}