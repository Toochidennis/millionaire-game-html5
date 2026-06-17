import { motion } from "motion/react";
import { cn } from "@/lib/cn";

type State = "idle" | "selected" | "correct" | "wrong" | "eliminated";

export function AnswerOption({
  label, text, state, onClick,
}: { label: string; text: string; state: State; onClick?: () => void }) {
  const styles: Record<State, string> = {
    idle: "glass hover:glass-hi",
    selected: "glass-hi neon-violet",
    correct: "bg-good/20 ring-1 ring-good text-ink",
    wrong: "bg-bad/20 ring-1 ring-bad text-ink",
    eliminated: "opacity-25 pointer-events-none line-through",
  };
  return (
    <motion.button
      layout
      whileTap={state === "idle" || state === "selected" ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn("flex items-center gap-3 rounded-2xl px-4 py-4 text-left transition", styles[state])}
    >
      <span className="display grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 font-bold text-cyan">{label}</span>
      <span className="text-base font-medium">{text}</span>
    </motion.button>
  );
}
