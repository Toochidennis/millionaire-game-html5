import type { MoneyRung } from "@/types";

/** Progressive money ladder. Safe havens = guaranteed floors on a loss. */
export const LADDER: MoneyRung[] = [
  500, 1_000, 2_000, 3_000, 5_000,
  7_500, 10_000, 25_000, 50_000, 100_000,
  200_000, 300_000, 500_000, 750_000, 1_000_000,
].map((amount, i) => ({
  level: i + 1,
  amount,
  safeHaven: i === 4 || i === 9,
}));

export const TOP_RUNG = LADDER.length - 1;

export function safeHavenFloor(rungIndex: number): number {
  let floor = 0;
  for (let i = 0; i < rungIndex; i++) if (LADDER[i].safeHaven) floor = LADDER[i].amount;
  return floor;
}

export const fmtMoney = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

/** Short form for stat chips — $1,000,000 → "$1M", $500,000 → "$500K", $1,000 → "$1K" */
export const fmtCompact = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(n);

/** Applies the player's game level as a prize multiplier. Level 1 = base, Level 2 = 2×, etc. */
export const applyLevel = (amount: number, level: number) => amount * Math.max(1, level);
