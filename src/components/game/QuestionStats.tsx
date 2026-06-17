import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import type { Question } from "@/types";
import { GlassCard } from "@/components/design/GlassCard";

export function QuestionStats({ q, picked }: { q: Question; picked: number }) {
  const { t } = useTranslation();
  const right = picked === q.correct;
  const pct = Math.round(q.globalAccuracy * 100);
  return (
    <GlassCard className="space-y-4" glow={right ? "cyan" : "violet"}>
      <div className="flex items-center justify-between gap-3">
        <span className="display text-lg font-semibold">
          {right ? t("game_correct") : t("game_missed")}
        </span>
        <span className="nums text-sm text-muted shrink-0">
          {t("game_accuracy", { pct })}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/8 overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-cyan to-violet"
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
      </div>
      <p className="text-sm leading-relaxed text-ink/85">
        <span className="text-cyan font-semibold">{t("game_why")}: </span>{q.explanation}
      </p>
    </GlassCard>
  );
}
