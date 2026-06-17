import { motion } from "motion/react";
import type { Question } from "@/types";
import { GlassCard } from "@/components/design/GlassCard";

/** Post-question statistics + detailed explanation. */
export function QuestionStats({ q, picked }: { q: Question; picked: number }) {
  const right = picked === q.correct;
  return (
    <GlassCard className="space-y-4" glow={right ? "cyan" : "violet"}>
      <div className="flex items-center justify-between">
        <span className="display text-lg font-semibold">{right ? "Correct" : "Missed it"}</span>
        <span className="nums text-sm text-muted">{Math.round(q.globalAccuracy * 100)}% got this right</span>
      </div>
      <div className="h-2 rounded-full bg-white/8 overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-cyan to-violet"
          initial={{ width: 0 }} animate={{ width: `${q.globalAccuracy * 100}%` }} transition={{ duration: 0.8 }} />
      </div>
      <p className="text-sm leading-relaxed text-ink/85">
        <span className="text-cyan font-semibold">Why: </span>{q.explanation}
      </p>
    </GlassCard>
  );
}
