import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "motion/react";
import { useGameStore, useSettingsStore } from "@/store";
import { loadQuestionBank } from "@/lib/questions";
import { fmtMoney, safeHavenFloor } from "@/lib/money";
import { PageTransition } from "@/components/design/PageTransition";
import { NeonButton } from "@/components/design/NeonButton";
import { GlassCard } from "@/components/design/GlassCard";
import { MoneyLadder } from "@/components/game/MoneyLadder";
import { Timer } from "@/components/game/Timer";
import { AnswerOption } from "@/components/game/AnswerOption";
import { Lifelines } from "@/components/game/Lifelines";
import { HostBubble } from "@/components/game/HostBubble";
import { QuestionStats } from "@/components/game/QuestionStats";
import type { Question } from "@/types";

export function Game() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const g = useGameStore();
  const hostVoice = useSettingsStore((s) => s.hostVoice);
  const [ladderOpen, setLadderOpen] = useState(false);

  // boot match
  useEffect(() => {
    let live = true;
    loadQuestionBank().then((bank) => { if (live) g.start("classic", bank); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // countdown
  useEffect(() => {
    const id = setInterval(() => g.tick(), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // terminal states route to results
  useEffect(() => {
    if (["won", "lost", "walked"].includes(g.phase)) {
      const timer = setTimeout(() => nav("/results"), 600);
      return () => clearTimeout(timer);
    }
  }, [g.phase, nav]);

  const q = g.current();
  if (!q) return null;

  const optState = (i: number) => {
    if (g.eliminated.includes(i)) return "eliminated" as const;
    if (g.phase === "revealing" || g.phase === "stats") {
      if (i === q.correct) return "correct" as const;
      if (i === g.locked) return "wrong" as const;
    }
    if (g.locked === i) return "selected" as const;
    if (g.selected === i) return "selected" as const;
    return "idle" as const;
  };

  return (
    <PageTransition>
      {/* top HUD */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setLadderOpen((v) => !v)} className="glass rounded-2xl px-4 py-2 nums text-gold font-semibold">
          {fmtMoney(g.rungIndex > 0 ? safeHavenFloor(g.rungIndex) : 0)} {t("game_safe")}
        </button>
        <span className="nums text-muted text-sm">{t("game_qOf", { n: g.rungIndex + 1 })}</span>
        <NeonButton variant="ghost" onClick={() => g.walkAway()} className="px-4 py-2 text-sm">{t("game_walk")}</NeonButton>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
        <div className="space-y-5">
          <Timer seconds={g.timeLeft} frozen={g.timeFrozen} />
          <HostBubble message={g.hostMessage} />

          <GlassCard glow="cyan" className="min-h-28 grid place-items-center text-center">
            <motion.h2 key={q.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="display text-xl sm:text-2xl font-semibold leading-snug">
              {q.prompt}
            </motion.h2>
          </GlassCard>

          <div className="grid gap-3 sm:grid-cols-2">
            {q.options.map((opt, i) => (
              <AnswerOption key={i} label={"ABCD"[i]} text={opt} state={optState(i)}
                onClick={() => g.select(i)} />
            ))}
          </div>

          <AnimatePresence>
            {g.phase === "stats" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }}>
                <QuestionStats q={q} picked={g.locked ?? -1} />
              </motion.div>
            )}
          </AnimatePresence>

          <Lifelines available={g.lifelines} onUse={(id) => g.useLifeline(id, hostVoice)} />

          <div className="flex gap-3">
            {g.phase === "asking" && (
              <NeonButton full disabled={g.selected == null} onClick={() => g.lock()}>{t("game_lock")}</NeonButton>
            )}
            {g.phase === "stats" && (
              <NeonButton full variant="gold" onClick={() => g.proceed()}>{t("game_next")}</NeonButton>
            )}
          </div>
        </div>

        {/* desktop ladder */}
        <div className="hidden lg:block"><MoneyLadder rungIndex={g.rungIndex} /></div>
      </div>

      {/* mobile ladder drawer */}
      <AnimatePresence>
        {ladderOpen && (
          <motion.div className="fixed inset-0 z-50 bg-void/70 backdrop-blur grid place-items-center p-6 lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLadderOpen(false)}>
            <MoneyLadder rungIndex={g.rungIndex} />
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

export type { Question };
