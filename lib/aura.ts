// Aura Points rules, shared by the odds card (preview) and the database (settle_odds_line)
export const AURA_LOSS = 50; // lost per wrong bet

// What a winning bet on a side pays: 100 × (other side ÷ this side), clamped 10–500
export function auraPayout(thisSide: number, otherSide: number): number {
  if (thisSide <= 0) return 500; // nobody here yet: long shot
  return Math.min(500, Math.max(10, Math.round((100 * otherSide) / thisSide)));
}
