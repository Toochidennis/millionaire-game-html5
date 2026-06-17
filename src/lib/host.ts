import type { GamePhase } from "@/types";

type Voice = "hype" | "calm" | "witty";

const LINES: Record<Voice, Record<string, string[]>> = {
  hype: {
    intro: ["The stage is yours. Let's chase that million!", "Cameras rolling — show the world what you've got."],
    correct: ["LOCKED AND CORRECT! The crowd goes wild!", "That's how a champion plays!"],
    wrong: ["Oof — the answer slipped away. Still a legend.", "Not this time, but what a run!"],
    safe: ["Safe haven secured. Nothing can take that now!"],
  },
  calm: {
    intro: ["Take a breath. Trust what you know.", "One question at a time. You've got this."],
    correct: ["Cleanly done. Onward.", "Right again — your instincts are sharp."],
    wrong: ["That one was tricky. Be proud of the climb.", "A miss, but the journey mattered."],
    safe: ["You've banked a guaranteed prize. Play freely now."],
  },
  witty: {
    intro: ["Fortune favours the well-read. Begin.", "No pressure — only a fortune on the line."],
    correct: ["Correct, and frankly, expected.", "The money ladder fears you."],
    wrong: ["Even Einstein flunked a quiz. Probably.", "The question won the round. Rematch?"],
    safe: ["Bagged. The taxman thanks you in advance."],
  },
};

export type HostKey = keyof (typeof LINES)["hype"];

export function hostLine(voice: Voice, key: HostKey): string {
  const pool = LINES[voice][key];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function hostForPhase(voice: Voice, phase: GamePhase): string | null {
  if (phase === "intro") return hostLine(voice, "intro");
  return null;
}
