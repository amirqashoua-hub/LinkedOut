// The 7 parody reactions. Keys must match Sophies's database constraint exactly.
export const REACTIONS = [
  { key: "oof", emoji: "😬", label: "OOF" },
  { key: "lol", emoji: "😂", label: "LOL" },
  { key: "ggez", emoji: "🤑", label: "GGEZ" },
  { key: "chudmaxxing", emoji: "🤡", label: "chudmaxxing" },
  { key: "twin", emoji: "👯‍♀️", label: "Twin" },
  { key: "W", emoji: "😎", label: "W" },
  { key: "real", emoji: "💯", label: "Real"}
] as const;

export type ReactionKey = (typeof REACTIONS)[number]["key"];
export type ReactionCounts = Partial<Record<ReactionKey, number>>;