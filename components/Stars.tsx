import { Star } from "lucide-react";

// Read-only star rating, e.g. <Stars value={3.6} /> → ★★★★☆ (rounded to the nearest star)
export default function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          style={{ width: size, height: size }}
          className={n <= full ? "fill-[#E7A33E] text-[#E7A33E]" : "fill-muted text-muted-foreground/40"}
        />
      ))}
    </span>
  );
}
