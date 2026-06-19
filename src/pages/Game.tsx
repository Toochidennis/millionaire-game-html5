import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "motion/react";
import { useGameStore, useSettingsStore } from "@/store";
import { loadQuestionBank, loadSeenIds, markSeen, getTotalLevels } from "@/lib/questions";
import { fmtMoney, safeHavenFloor } from "@/lib/money";
import { NeonButton } from "@/components/design/NeonButton";
import { GlassCard } from "@/components/design/GlassCard";
import { MoneyLadder } from "@/components/game/MoneyLadder";
import { Timer } from "@/components/game/Timer";
import { AnswerOption } from "@/components/game/AnswerOption";
import { Lifelines } from "@/components/game/Lifelines";
import { HostBubble } from "@/components/game/HostBubble";
import { QuestionStats } from "@/components/game/QuestionStats";


export function Game() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const g = useGameStore();
  const hostVoice = useSettingsStore((s) => s.hostVoice);
  const pace = useSettingsStore((s) => s.pace);
  const language = useSettingsStore((s) => s.language);
  const setTotalLevels = useSettingsStore((s) => s.setTotalLevels);

  useEffect(() => {
    let live = true;
    Promise.all([loadQuestionBank(language), loadSeenIds(language)]).then(([bank, seenIds]) => {
      if (!live) return;
      setTotalLevels(getTotalLevels(bank));
      g.start("classic", bank, pace, seenIds);
    });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setInterval(() => g.tick(), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (g.phase === "won") {
      // Persist played question IDs then celebrate
      markSeen(language, g.questions.map((q) => q.id)).then(() => nav("/level-complete"));
      return;
    }
    if (g.phase === "lost" || g.phase === "walked") {
      const timer = setTimeout(() => nav("/results"), 600);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g.phase]);

  // Auto-advance to next question after 3.5 s on correct answer
  useEffect(() => {
    if (g.phase !== "stats") return;
    const timer = setTimeout(() => g.proceed(), 5500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g.phase]);

  const q = g.current();
  if (!q) return null;

  const optState = (i: number) => {
    if (g.eliminated.includes(i)) return "eliminated" as const;
    if (g.phase === "revealing" || g.phase === "stats") {
      if (i === q.correct) return "correct" as const;
      if (i === g.locked) return "wrong" as const;
    }
    if (g.locked === i || g.selected === i) return "selected" as const;
    return "idle" as const;
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-dvh flex flex-col overflow-hidden px-4 pt-3 pb-2 sm:px-6 max-w-2xl mx-auto w-full select-none relative"
    >
      {/* HUD */}
      <div className="flex items-center justify-between shrink-0 mb-2">
        <span className="glass rounded-2xl px-3 py-1.5 nums text-gold font-semibold text-sm">
          {fmtMoney(g.rungIndex > 0 ? safeHavenFloor(g.rungIndex) : 0)} {t("game_safe")}
        </span>
        <span className="nums text-muted text-sm">{t("game_qOf", { n: g.rungIndex + 1 })}</span>
        <NeonButton variant="ghost" onClick={() => g.walkAway()} className="px-3 py-1.5 text-sm">
          {t("game_walk")}
        </NeonButton>
      </div>

      {/* Money ladder — horizontal scrolling strip, always visible */}
      <div className="shrink-0 mb-2 -mx-4 sm:-mx-6 border-y border-white/5 bg-white/[0.03]">
        <MoneyLadder rungIndex={g.rungIndex} />
      </div>

      {/* Timer — hidden in chill mode */}
      {pace === "classic" && (
        <div className="shrink-0 mb-2">
          <Timer seconds={g.timeLeft} frozen={g.timeFrozen} />
        </div>
      )}

      {/* Body */}
      <div className="flex-1 flex flex-col min-h-0 gap-3">
        {g.hostMessage && (
          <div className="shrink-0">
            <HostBubble message={g.hostMessage} />
          </div>
        )}

        {/* Question card */}
        <GlassCard glow="cyan" className="shrink-0 !p-4 !rounded-xl min-h-28 grid place-items-center">
          <motion.h2
            key={q.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="display text-lg sm:text-xl font-semibold leading-snug text-center"
          >
            {q.prompt}
          </motion.h2>
        </GlassCard>

        {/* Lifelines */}
        <div className="shrink-0">
          <Lifelines available={g.lifelines} onUse={(id) => g.useLifeline(id, hostVoice)} pace={pace} />
        </div>

        {/* Answer grid */}
        <div className="flex-1 flex flex-col justify-start min-h-0">
          <div className="grid gap-2 sm:grid-cols-2">
            {q.options.map((opt, i) => (
              <AnswerOption key={i} label={"ABCD"[i]} text={opt} state={optState(i)}
                onClick={() => g.select(i)} />
            ))}
          </div>
        </div>
      </div>

      {/* Stats overlay */}
      <AnimatePresence>
        {g.phase === "stats" && (
          <motion.div
            initial={{ y: "120%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "120%", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
            className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-3 pt-2 sm:px-6"
            style={{ background: "linear-gradient(to top, var(--color-void) 60%, transparent)" }}
          >
            <div className="relative w-full h-0.5 bg-white/10 rounded-full mb-3">
              <motion.div
                key={g.rungIndex}
                className="absolute inset-0 bg-gold rounded-full"
                initial={{ clipPath: "inset(0 0% 0 0)" }}
                animate={{ clipPath: "inset(0 100% 0 0)" }}
                transition={{ duration: 5.5, ease: "linear" }}
              />
            </div>
            <QuestionStats q={q} picked={g.locked ?? -1} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
