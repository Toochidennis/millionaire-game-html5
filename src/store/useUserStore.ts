import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Achievement, UserProfile } from "@/types";

const ACHIEVEMENTS: Achievement[] = [
  { id: "first_win", title: "First Blood", description: "Win your first match", icon: "Sparkles", unlocked: false, progress: 0, rarity: "common" },
  { id: "streak_5", title: "On Fire", description: "Answer 5 in a row", icon: "Flame", unlocked: false, progress: 0, rarity: "rare" },
  { id: "millionaire", title: "Millionaire", description: "Reach the top rung", icon: "Crown", unlocked: false, progress: 0, rarity: "legendary" },
  { id: "globe", title: "Globetrotter", description: "Rank in 3 country boards", icon: "Globe", unlocked: false, progress: 0, rarity: "epic" },
];

function guest(): UserProfile {
  return {
    id: crypto.randomUUID(), guest: true, name: "Guest Player",
    avatar: "0", countryCode: "NG", locale: "en",
    stats: { gamesPlayed: 0, bestWinnings: 0, wallet: 0, totalCorrect: 0, totalAnswered: 0, longestStreak: 0, xp: 0, level: 1, perfectGames: 0 },
    achievements: ACHIEVEMENTS, journeyNode: 1, seasonTier: 1, seasonXp: 0,
  };
}

interface UserStore {
  profile: UserProfile | null;
  loginGuest: () => void;
  loginNamed: (name: string, countryCode: string) => void;
  setAvatar: (avatarId: string) => void;
  recordResult: (winnings: number, correct: number, answered: number, streak: number, perfect: boolean) => void;
  setWallet: (amount: number) => void;
  addToWallet: (amount: number) => void;
  levelUp: () => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: null,
      loginGuest: () => set({ profile: guest() }),
      loginNamed: (name, countryCode) => set({ profile: { ...guest(), guest: false, name, countryCode } }),
      setAvatar: (avatarId) => {
        const p = get().profile; if (!p) return;
        set({ profile: { ...p, avatar: avatarId } });
      },
      recordResult: (winnings, correct, answered, streak, perfect) => {
        const p = get().profile; if (!p) return;
        const xp = p.stats.xp + correct * 50 + (perfect ? 500 : 0);
        set({
          profile: {
            ...p,
            stats: {
              ...p.stats,
              gamesPlayed: p.stats.gamesPlayed + 1,
              bestWinnings: Math.max(p.stats.bestWinnings, winnings),
              totalCorrect: p.stats.totalCorrect + correct,
              totalAnswered: p.stats.totalAnswered + answered,
              longestStreak: Math.max(p.stats.longestStreak, streak),
              perfectGames: p.stats.perfectGames + (perfect ? 1 : 0),
              xp,
              // level is managed explicitly via levelUp() — not derived from XP
            },
          },
        });
      },
      setWallet: (amount) => {
        const p = get().profile; if (!p) return;
        set({ profile: { ...p, stats: { ...p.stats, wallet: amount } } });
      },
      addToWallet: (amount) => {
        const p = get().profile; if (!p) return;
        if (amount <= 0) return;
        set({ profile: { ...p, stats: { ...p.stats, wallet: (p.stats.wallet ?? 0) + amount } } });
      },
      levelUp: () => {
        const p = get().profile; if (!p) return;
        set({ profile: { ...p, stats: { ...p.stats, level: p.stats.level + 1 } } });
      },
      logout: () => set({ profile: null }),
    }),
    { name: "trivia-user" }
  )
);
