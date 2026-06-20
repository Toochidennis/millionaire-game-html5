import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";
import type { Question } from "@/types";
import { GlassCard } from "@/components/design/GlassCard";
import { NeonButton } from "@/components/design/NeonButton";

export function QuestionStats({
  q, picked, onContinue,
}: { q: Question; picked: number; onContinue: () => void }) {
  const { t } = useTranslation();
  const right = picked === q.correct;
  const pct = Math.round(q.globalAccuracy * 100);
  const showPicked = !right && picked >= 0; // wrong pick (skip when timed out / no answer)

  return (
    <GlassCard className="relative space-y-4" glow={right ? "cyan" : "violet"}>
      {/* Close — same action as Continue */}
      <button
        onClick={onContinue}
        aria-label={t("game_continue")}
        className="absolute top-3 right-3 z-10 grid h-7 w-7 place-items-center rounded-full bg-white/8 text-muted hover:text-ink hover:bg-white/15 transition active:scale-90"
      >
        <X size={15} />
      </button>

      <div className="flex items-center justify-between gap-3 pr-9">
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

      {/* Answer reveal — your wrong pick (if any) + the correct answer */}
      <div className="space-y-2">
        {showPicked && (
          <div className="flex items-center gap-2.5 rounded-xl bg-bad/15 ring-1 ring-bad/40 px-3 py-2">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-bad/25">
              <X size={12} className="text-bad" />
            </span>
            <span className="text-sm font-medium text-ink/90 truncate">{q.options[picked]}</span>
          </div>
        )}
        <div className="flex items-center gap-2.5 rounded-xl bg-good/15 ring-1 ring-good/40 px-3 py-2">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-good/25">
            <Check size={12} className="text-good" />
          </span>
          <span className="text-sm font-medium text-ink/90 truncate">{q.options[q.correct]}</span>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-ink/85">
        <span className="text-cyan font-semibold">{t("game_why")}: </span>{q.explanation}
      </p>

      <NeonButton
        full
        variant={right ? "gold" : "ghost"}
        onClick={onContinue}
        className="py-3 text-base font-bold"
      >
        {t("game_continue")}
      </NeonButton>
    </GlassCard>
  );
}
