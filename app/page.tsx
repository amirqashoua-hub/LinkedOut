import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";

export default async function Home() {
  // Read the feed from Supabase (Person 2's "feed" view)
  const supabase = createClient(await cookies());
  const { data: posts, error } = await supabase.from("feed").select("*");

  // TEMPORARY diagnostics: how many rows can we see in each table?
  const tables = ["profiles", "posts", "experience", "skills"] as const;
  const counts = await Promise.all(
    tables.map(async (t) => {
      const { count, error } = await supabase.from(t).select("*", { count: "exact", head: true });
      return `${t}: ${error ? "❌ " + error.message : count}`;
    })
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[225px_minmax(0,1fr)] lg:grid-cols-[225px_minmax(0,1fr)_300px]">
      <LeftSidebar />

      <section className="space-y-2">
        {/* TEMPORARY: tells us whether Supabase works. Replaced in step 3b */}
        <div className="rounded-lg border bg-card p-4 text-sm">
          {error
            ? `❌ Supabase error: ${error.message}`
            : `✅ Supabase returned ${posts.length} posts. First author: ${posts[0]?.full_name ?? "none"}`}
        </div>

        <div className="rounded-lg border bg-card p-4 text-sm">
          {counts.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>

      <RightSidebar />
    </div>
  );
}