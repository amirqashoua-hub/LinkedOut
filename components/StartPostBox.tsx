import { Image as ImageIcon, CalendarDays, Newspaper } from "lucide-react";
import Avatar from "@/components/Avatar";

const OPTIONS = [
  { icon: ImageIcon, label: "Evidence", color: "text-[#378FE9]" },
  { icon: CalendarDays, label: "Event", color: "text-[#C37D16]" },
  { icon: Newspaper, label: "Write confession", color: "text-[#E06847]" },
];

export default function StartPostBox() {
  return (
    <div className="rounded-lg border bg-card px-4 pt-3 pb-1">
      <div className="flex gap-2">
        <Avatar name="Sophie Tremblay" size={48} />
        <button className="flex-1 rounded-full border border-[#8C8C8C] px-4 text-left text-sm font-semibold text-muted-foreground hover:bg-accent">
          Start a post about your latest failure
        </button>
      </div>
      <div className="mt-1 flex justify-around">
        {OPTIONS.map(({ icon: Icon, label, color }) => (
          <button
            key={label}
            className="flex items-center gap-2 rounded px-2 py-3 text-sm font-semibold text-muted-foreground hover:bg-accent"
          >
            <Icon className={`h-5 w-5 ${color}`} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}