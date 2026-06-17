// Central domain model. Everything is typed; stores import from here.

export type Difficulty = "easy" | "medium" | "hard" | "expert";
export type Category =
  | "science" | "history" | "geography" | "sports"
  | "entertainment" | "tech" | "art" | "nature";

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
  prompt: string;
  /** index 0..3 of the correct answer in `options` */
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  /** shown on the answer-explanation screen */
  explanation: string;
  /** % of all players who got it right — powers the post-question stats */
  globalAccuracy: number;
  /** i18n: prompts can be keyed; raw strings are the fallback */
  i18nKey?: string;
}

export type LifelineId = "fiftyFifty" | "askAi" | "crowdVote" | "timeFreeze" | "skip";

export interface LifelineState {
  id: LifelineId;
  used: boolean;
}

/** Finite-state machine for a single match. Drives all transitions. */
export type GamePhase =
  | "idle"        // not started
  | "intro"       // host greeting
  | "asking"      // question on screen, timer running
  | "locked"      // player locked an answer, awaiting reveal
  | "revealing"   // correct/incorrect animation
  | "stats"       // post-question statistics + explanation
  | "won"         // reached top rung
  | "lost"        // wrong answer
  | "walked";     // cashed out

export type GameMode = "classic" | "daily" | "duel" | "journey";

export interface MoneyRung {
  level: number;      // 1-based
  amount: number;
  safeHaven: boolean; // guaranteed floor on a wrong answer
}

export interface MatchState {
  mode: GameMode;
  phase: GamePhase;
  rungIndex: number;            // current position on the ladder (0-based)
  questions: Question[];
  selected: number | null;      // currently highlighted option
  locked: number | null;        // locked answer index
  lifelines: Record<LifelineId, boolean>; // true = still available
  eliminated: number[];         // option indices removed by 50:50
  timeLeft: number;             // seconds
  timeFrozen: boolean;
  hostMessage: string | null;
  streak: number;
  startedAt: number;
}

export interface UserStats {
  gamesPlayed: number;
  bestWinnings: number;
  totalCorrect: number;
  totalAnswered: number;
  longestStreak: number;
  xp: number;
  level: number;
  perfectGames: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;            // lucide icon name
  unlocked: boolean;
  progress: number;        // 0..1
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface UserProfile {
  id: string;
  guest: boolean;
  name: string;
  avatar: string;
  countryCode: string;     // ISO-3166 alpha-2
  locale: string;
  stats: UserStats;
  achievements: Achievement[];
  journeyNode: number;     // furthest unlocked journey node
  seasonTier: number;
  seasonXp: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  countryCode: string;
  winnings: number;
  isMe?: boolean;
}

export type LeaderboardScope = "global" | "country" | "season" | "friends";

export interface ThemePreset {
  id: string;
  name: string;
  accentFrom: string;
  accentTo: string;
}

export interface Settings {
  themeId: string;
  reducedMotion: boolean;
  highContrast: boolean;
  textScale: number;       // 0.9..1.4
  music: number;           // 0..1
  sfx: number;             // 0..1
  hapticsOn: boolean;
  hostVoice: "hype" | "calm" | "witty";
  language: string;
}
