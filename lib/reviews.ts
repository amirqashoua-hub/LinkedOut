// Sub-ratings on event reviews (Glassdoor-style). Each is optional, 1-5.
export const REVIEW_CATEGORIES = [
  { key: "vibes", label: "Vibes" },
  { key: "drinks", label: "Drinks" },
  { key: "music", label: "Music" },
  { key: "line_wait", label: "Line wait", hint: "5 = walked right in" },
] as const;

export type CategoryKey = (typeof REVIEW_CATEGORIES)[number]["key"];
export type CategoryRatings = Partial<Record<CategoryKey, number | null>>;
