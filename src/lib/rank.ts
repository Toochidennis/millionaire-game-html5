import { gameService, type ApiRank } from "@/api/services/game.service";

export interface RankResult {
  rank: number;
  total: number;
  countryCode: string;
}

/**
 * Single seam for "player's country rank". Flip USE_MOCK_RANK to false once the
 * leaderboard backend is live — callers (RankModal) never change because the
 * signature is already async and returns the same shape as the API.
 */
const USE_MOCK_RANK = true;

// Stable per-country field size so a country's "total players" doesn't jump per call.
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

// Slot the player's winnings into a plausible country field by percentile:
// higher winnings → better (lower) rank. Deterministic for a given (country, winnings).
function mockRank(countryCode: string, winnings: number): RankResult {
  const total = 250 + (hash(countryCode) % 750); // 250–1000 players, stable per country
  const cap = 1_000_000;
  if (winnings <= 0) return { rank: total, total, countryCode };
  const pct = Math.min(winnings, cap) / cap;      // 0..1
  const rank = Math.max(1, Math.round(total * (1 - pct)));
  return { rank, total, countryCode };
}

export async function getMyRank(opts: { countryCode: string; winnings: number }): Promise<RankResult> {
  if (USE_MOCK_RANK) return mockRank(opts.countryCode, opts.winnings);
  const data: ApiRank = await gameService.getMyRank(opts.countryCode);
  return { rank: data.rank, total: data.total, countryCode: data.countryCode };
}
