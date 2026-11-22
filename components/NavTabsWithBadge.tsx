import NavTabs from "@/components/NavTabs";
import { getUnseenGuiltTripCount } from "@/lib/data";

// The nav tabs with the real number of unseen Guilt Trips on the red badge
export default async function NavTabsWithBadge() {
  const unseen = await getUnseenGuiltTripCount().catch(() => 0);
  return <NavTabs guiltTrips={unseen} />;
}
