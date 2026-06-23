import { create } from "zustand";
import type { GameMode, GamePace, LifelineId, MatchState, Question } from "@/types";
import { LADDER, TOP_RUNG, safeHavenFloor } from "@/lib/money";
import { buildMatch } from "@/lib/questions";
import { sfx } from "@/lib/audio";
import i18n from "@/lib/i18n";

const QUESTION_TIME = 30;

function crowdDist(correct: number): number[] {
  const correctPct = 45 + Math.floor(Math.random() * 26); // 45–70 %
  const rest = 100 - correctPct;
  const a = Math.floor(Math.random() * rest);
  const b = Math.floor(Math.random() * rest);
  const [lo, hi] = a < b ? [a, b] : [b, a];
  const parts = [lo, hi - lo, rest - hi];
  const pcts = [0, 0, 0, 0];
  pcts[correct] = correctPct;
  [0, 1, 2, 3].filter((i) => i !== correct).forEach((idx, j) => { pcts[idx] = parts[j]; });
  return pcts;
}

interface GameStore extends MatchState {
  bank: Question[];   // full question pool — kept outside MatchState so it's not reset on proceed
  // resume intent — set when a lost run is being continued; consumed by start()
  resumeRung: number | null;
  resumeExcludeId: string | null;
  // selectors
  current: () => Question | null;
  winnings: () => number;
  // actions
  start: (mode: GameMode, bank: Question[], pace?: GamePace, seenIds?: Set<string>) => void;
  requestResume: () => void;
  select: (i: number) => void;
  lock: () => void;
  reveal: () => void;
  proceed: () => void;
  walkAway: () => void;
  useLifeline: (id: LifelineId, hostVoice: "hype" | "calm" | "witty") => void;
  tick: () => void;
  reset: () => void;
}

const initial: MatchState = {
  mode: "classic",
  pace: "classic",
  phase: "idle",
  rungIndex: 0,
  questions: [],
  selected: null,
  locked: null,
  lifelines: { fiftyFifty: true, askAi: true, crowdVote: true, timeFreeze: true, skip: true, resetQuestion: true },
  eliminated: [],
  timeLeft: QUESTION_TIME,
  timeFrozen: false,
  hostMessage: null,
  crowdVotes: null,
  streak: 0,
  startedAt: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initial,
  bank: [],
  resumeRung: null,
  resumeExcludeId: null,

  current: () => get().questions[get().rungIndex] ?? null,
  winnings: () => {
    const { phase, rungIndex } = get();
    if (phase === "won") return LADDER[TOP_RUNG].amount;
    if (phase === "walked") return rungIndex > 0 ? LADDER[rungIndex - 1].amount : 0;
    if (phase === "lost") return safeHavenFloor(rungIndex);
    return rungIndex > 0 ? LADDER[rungIndex - 1].amount : 0;
  },

  start: (mode, bank, pace = "classic", seenIds = new Set<string>()) => {
    // Honor a pending resume: rebuild a fresh match but jump to the failed rung,
    // excluding the failed question so the resumed rung shows a different one.
    const { resumeRung, resumeExcludeId } = get();
    const resuming = resumeRung != null;
    const seen = new Set(seenIds);
    if (resuming && resumeExcludeId) seen.add(resumeExcludeId);
    set({
      ...initial,
      bank,
      mode,
      pace,
      questions: buildMatch(bank, LADDER.length, seen),
      rungIndex: resuming ? resumeRung : 0,
      resumeRung: null,
      resumeExcludeId: null,
      timeLeft: pace === "classic" ? QUESTION_TIME : Infinity,
      phase: "asking",
      startedAt: Date.now(),
    });
  },

  // Snapshot the current (lost) rung + failed question so the next start() resumes there.
  // Also neutralize the "lost" phase so the Game screen doesn't bounce back to /results
  // before the countdown + start() can run.
  requestResume: () => {
    const { rungIndex, questions } = get();
    set({
      resumeRung: rungIndex,
      resumeExcludeId: questions[rungIndex]?.id ?? null,
      phase: "idle",
    });
  },

  select: (i) => {
    const { phase, eliminated } = get();
    if (phase !== "asking" || eliminated.includes(i)) return;
    sfx.lock();
    set({ selected: i, locked: i, phase: "locked" });
    setTimeout(() => get().reveal(), 800);
  },

  lock: () => {
    const { phase, selected } = get();
    if (phase !== "asking" || selected == null) return;
    sfx.lock();
    set({ locked: selected, phase: "locked" });
    setTimeout(() => get().reveal(), 800);
  },

  reveal: () => {
    const { locked, current } = get();
    const q = current();
    if (!q || locked == null) return;
    const right = locked === q.correct;
    right ? sfx.correct() : sfx.wrong();
    set({ phase: "revealing", streak: right ? get().streak + 1 : 0 });
    setTimeout(() => set({ phase: "stats" }), 600);
  },

  proceed: () => {
    const { rungIndex, pace, locked, questions } = get();
    const wasCorrect = locked === (questions[rungIndex]?.correct ?? -1);
    if (!wasCorrect) { set({ phase: "lost" }); return; }
    if (rungIndex >= TOP_RUNG) { sfx.win(); set({ phase: "won" }); return; }
    set({
      rungIndex: rungIndex + 1,
      phase: "asking",
      selected: null,
      locked: null,
      eliminated: [],
      timeLeft: pace === "classic" ? QUESTION_TIME : Infinity,
      timeFrozen: false,
      hostMessage: null,
      crowdVotes: null,
    });
  },

  walkAway: () => set({ phase: "walked" }),

  useLifeline: (id, _hostVoice) => {
    const { lifelines, current, phase, bank, questions, rungIndex } = get();
    const q = current();
    if (!q || !lifelines[id] || phase !== "asking") return;
    const next = { ...lifelines, [id]: false };

    switch (id) {
      case "fiftyFifty": {
        const wrong = [0, 1, 2, 3].filter((i) => i !== q.correct);
        const drop = wrong.sort(() => Math.random() - 0.5).slice(0, 2);
        set({ eliminated: drop, lifelines: next });
        break;
      }
      case "timeFreeze":
        set({ timeFrozen: true, lifelines: next });
        break;
      case "skip":
        set({ lifelines: next, selected: q.correct, locked: q.correct });
        get().proceed();
        return;
      case "askAi":
        // Host personality (hostLine) intentionally omitted from the bubble — it isn't
        // localized, so we show only the translated AI suggestion. Personality kept for future use.
        set({ hostMessage: i18n.t("game_host_ai", { letter: "ABCD"[q.correct] }), lifelines: next });
        break;
      case "crowdVote":
        set({ hostMessage: i18n.t("game_host_crowd"), crowdVotes: crowdDist(q.correct), lifelines: next });
        break;
      case "resetQuestion": {
        const targetLevel = rungIndex + 1;
        const pool = bank.filter((b) => b.level === targetLevel && b.id !== q.id);
        const fallback = pool.length ? pool : bank.filter((b) => b.id !== q.id);
        if (!fallback.length) break;
        const replacement = fallback[Math.floor(Math.random() * fallback.length)];
        const newQuestions = [...questions];
        newQuestions[rungIndex] = replacement;
        // intentionally NOT consuming this lifeline — reusable every question
        set({ questions: newQuestions, selected: null, locked: null, eliminated: [], hostMessage: null, crowdVotes: null });
        break;
      }
    }
  },

  tick: () => {
    const { phase, pace, timeLeft, timeFrozen } = get();
    if (phase !== "asking" || timeFrozen || pace === "chill") return;
    if (timeLeft <= 1) { set({ timeLeft: 0, phase: "lost" }); return; }
    set({ timeLeft: timeLeft - 1 });
  },

  reset: () => set({ ...initial, bank: [], resumeRung: null, resumeExcludeId: null }),
}));
