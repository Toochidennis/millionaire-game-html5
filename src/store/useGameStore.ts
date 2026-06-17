import { create } from "zustand";
import type { GameMode, LifelineId, MatchState, Question } from "@/types";
import { LADDER, TOP_RUNG, safeHavenFloor } from "@/lib/money";
import { buildMatch } from "@/lib/questions";
import { hostLine } from "@/lib/host";
import { sfx } from "@/lib/audio";
import i18n from "@/lib/i18n";

const QUESTION_TIME = 30;

interface GameStore extends MatchState {
  // selectors
  current: () => Question | null;
  winnings: () => number;
  // actions
  start: (mode: GameMode, bank: Question[]) => void;
  select: (i: number) => void;
  lock: () => void;
  reveal: () => void;
  proceed: () => void;          // stats -> next question
  walkAway: () => void;
  useLifeline: (id: LifelineId, hostVoice: "hype" | "calm" | "witty") => void;
  tick: () => void;
  reset: () => void;
}

const initial: MatchState = {
  mode: "classic",
  phase: "idle",
  rungIndex: 0,
  questions: [],
  selected: null,
  locked: null,
  lifelines: { fiftyFifty: true, askAi: true, crowdVote: true, timeFreeze: true, skip: true },
  eliminated: [],
  timeLeft: QUESTION_TIME,
  timeFrozen: false,
  hostMessage: null,
  streak: 0,
  startedAt: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initial,

  current: () => get().questions[get().rungIndex] ?? null,
  winnings: () => {
    const { phase, rungIndex } = get();
    if (phase === "won") return LADDER[TOP_RUNG].amount;
    if (phase === "walked") return rungIndex > 0 ? LADDER[rungIndex - 1].amount : 0;
    if (phase === "lost") return safeHavenFloor(rungIndex);
    return rungIndex > 0 ? LADDER[rungIndex - 1].amount : 0;
  },

  start: (mode, bank) =>
    set({
      ...initial,
      mode,
      questions: buildMatch(bank, LADDER.length),
      phase: "asking",
      startedAt: Date.now(),
    }),

  select: (i) => {
    const { phase, eliminated } = get();
    if (phase !== "asking" || eliminated.includes(i)) return;
    sfx.select();
    set({ selected: i });
  },

  lock: () => {
    const { phase, selected } = get();
    if (phase !== "asking" || selected == null) return;
    sfx.lock();
    set({ locked: selected, phase: "locked" });
    setTimeout(() => get().reveal(), 1100);
  },

  reveal: () => {
    const { locked, current } = get();
    const q = current();
    if (!q || locked == null) return;
    const right = locked === q.correct;
    right ? sfx.correct() : sfx.wrong();
    set({ phase: "revealing", streak: right ? get().streak + 1 : 0 });
    setTimeout(() => {
      if (!right) { set({ phase: "lost" }); return; }
      set({ phase: "stats" });
    }, 1200);
  },

  proceed: () => {
    const { rungIndex } = get();
    if (rungIndex >= TOP_RUNG) { sfx.win(); set({ phase: "won" }); return; }
    set({
      rungIndex: rungIndex + 1,
      phase: "asking",
      selected: null,
      locked: null,
      eliminated: [],
      timeLeft: QUESTION_TIME,
      timeFrozen: false,
      hostMessage: null,
    });
  },

  walkAway: () => set({ phase: "walked" }),

  useLifeline: (id, hostVoice) => {
    const { lifelines, current, phase } = get();
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
        set({ lifelines: next, selected: q.correct });
        get().proceed();
        return;
      case "askAi":
        set({ hostMessage: `${hostLine(hostVoice, "intro")} ${i18n.t("game_host_ai", { letter: "ABCD"[q.correct] })}`, lifelines: next });
        break;
      case "crowdVote":
        set({ hostMessage: i18n.t("game_host_crowd"), lifelines: next });
        break;
    }
  },

  tick: () => {
    const { phase, timeLeft, timeFrozen } = get();
    if (phase !== "asking" || timeFrozen) return;
    if (timeLeft <= 1) { set({ timeLeft: 0, phase: "lost" }); return; }
    set({ timeLeft: timeLeft - 1 });
  },

  reset: () => set({ ...initial }),
}));
