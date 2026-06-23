import { create } from "zustand";
import type { LeaderboardEntry, LeaderboardScope } from "@/types";

const NAMES = ["Ada", "Kenji", "Sofia", "Liam", "Aisha", "Mateo", "Yuki", "Zara", "Omar", "Ines"];
const CC = ["NG", "JP", "BR", "US", "EG", "MX", "KR", "ZA", "AE", "PT"];

/** Mock generator; replace with a paginated fetch to your leaderboard API. */
function gen(seed: number): LeaderboardEntry[] {
  return Array.from({ length: 20 }, (_, i) => ({
    rank: i + 1,
    name: NAMES[(i + seed) % NAMES.length] + (i > 9 ? "_" + i : ""),
    countryCode: CC[(i * 3 + seed) % CC.length],
    winnings: Math.round((1_000_000 / (i + 1)) * (0.7 + ((seed % 5) * 0.05))),
  }));
}

interface LBStore {
  scope: LeaderboardScope;
  setScope: (s: LeaderboardScope) => void;
  rows: (countryCode?: string) => LeaderboardEntry[];
}

export const useLeaderboardStore = create<LBStore>((set, get) => ({
  scope: "global",
  setScope: (scope) => set({ scope }),
  rows: (countryCode) => {
    const scope = get().scope;
    const seed = scope === "global" ? 0 : scope === "season" ? 2 : 1;
    let rows = gen(seed);
    if (scope === "country" && countryCode) rows = rows.filter((r) => r.countryCode === countryCode).length
      ? rows.map((r) => ({ ...r, countryCode }))
      : rows.map((r) => ({ ...r, countryCode }));
    return rows;
  },
}));
