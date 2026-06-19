import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "motion/react";
import { useGameStore, useSettingsStore } from "@/store";
import { loadQuestionBank, getTotalLevels, loadSeenIds, markSeen } from "@/lib/questions";
import { fmtMoney, safeHavenFloor } from "@/lib/money";
import { NeonButton } from "@/components/design/NeonButton";
import { GlassCard } from "@/components/design/GlassCard";
import { Timer } from "@/components/game/Timer";
import { AnswerOption } from "@/components/game/AnswerOption";
import { Lifelines } from "@/components/game/Lifelines";
import { HostBubble } from "@/components/game/HostBubble";
import { QuestionStats } from "@/components/game/QuestionStats";
import { PrizeLadderOverlay } from "@/components/game/PrizeLadderOverlay";

export function Game() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const g = useGameStore();
  const hostVoice  = useSettingsStore((s) => s.hostVoice);
  const pace       = useSettingsStore((s) => s.pace);
  const language   = useSettingsStore((s) => s.language);
  const setTotalLevels = useSettingsStore((s) => s.setTotalLevels);

  const [ladderVisible, setLadderVisible] = useState(false);
  const hideTimerRef    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const proceedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => {
    clearTimeout(hideTimerRef.current);
    clearTimeout(proceedTimerRef.current);
  }, []);

  const showLadder = () => {
    setLadderVisible(true);
    hideTimerRef.current    = setTimeout(() => setLadderVisible(false), 3600);
    proceedTimerRef.current = setTimeout(() => g.proceed(),             4300);
  };

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
      markSeen(language, g.questions.map((q) => q.id)).then(() => nav("/level-complete"));
      return;
    }
    if (g.phase === "lost" || g.phase === "walked") {
      const timer = setTimeout(() => nav("/results"), 600);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g.phase]);

  const q = g.current();
  if (!q) return null;

  const level = g.rungIndex + 1;

  const optState = (i: number) => {
    if (g.eliminated.includes(i)) return "eliminated" as const;
    if (g.phase === "revealing" || g.phase === "stats") {
      if (i === q.correct) return "correct" as const;
      if (i === g.locked)  return "wrong"   as const;
    }
    if (g.locked === i || g.selected === i) return "selected" as const;
    return "idle" as const;
  };

  return (
    <div className="h-dvh flex flex-col overflow-hidden px-4 pt-3 pb-2 sm:px-6 max-w-2xl mx-auto w-full select-none relative">
      {/* HUD */}
      <div className="flex items-center justify-between shrink-0 mb-4">
        <span className="glass rounded-2xl px-3 py-1.5 nums text-gold font-semibold text-sm">
          {fmtMoney(g.rungIndex > 0 ? safeHavenFloor(g.rungIndex) : 0)} {t("game_safe")}
        </span>
        <span className="glass px-3 py-1 rounded-full text-xs font-semibold text-muted uppercase tracking-widest">
          {t("dash_level")} {level}
        </span>
        <NeonButton variant="ghost" onClick={() => g.walkAway()} className="px-3 py-1.5 text-sm">
          {t("game_walk")}
        </NeonButton>
      </div>

      {/* Timer — hidden in chill mode */}
      {pace === "classic" && (
        <div className="shrink-0 mb-4">
          <Timer seconds={g.timeLeft} frozen={g.timeFrozen} />
        </div>
      )}

      {/* Body */}
      <div className="flex-1 flex flex-col min-h-0 gap-6">
        {/* Question card — host bubble overlays on top, no layout shift */}
        <div className="relative shrink-0 mt-6">
          <GlassCard glow="cyan" className="!p-4 !rounded-xl min-h-28 flex flex-col items-center justify-center gap-2">
            <span className="nums text-xs text-muted/60 uppercase tracking-widest">
              {t("game_qOf", { n: g.rungIndex + 1 })}
            </span>
            <motion.h2
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`display text-lg sm:text-xl font-semibold leading-snug text-center transition-opacity duration-300 ${g.hostMessage ? "opacity-20" : "opacity-100"}`}
            >
              {q.prompt}
            </motion.h2>
          </GlassCard>
          {g.hostMessage && (
            <div className="absolute inset-0 flex items-center px-4">
              <HostBubble message={g.hostMessage} />
            </div>
          )}
        </div>

        {/* Lifelines */}
        <div className="shrink-0 py-2">
          <Lifelines available={g.lifelines} onUse={(id) => g.useLifeline(id, hostVoice)} pace={pace} />
        </div>

        {/* Answer grid */}
        <div className="flex-1 flex flex-col justify-start min-h-0">
          <div className="grid gap-3 sm:grid-cols-2">
            {q.options.map((opt, i) => (
              <AnswerOption key={i} label={"ABCD"[i]} text={opt} state={optState(i)}
                onClick={() => g.select(i)} />
            ))}
          </div>
        </div>
      </div>

      {/* Stats overlay — all answers; Continue for correct, "Run ended" for wrong */}
      <AnimatePresence>
        {g.phase === "stats" && !ladderVisible && (
          <motion.div
            initial={{ y: "120%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "120%", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
            className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-3 pt-2 sm:px-6"
            style={{ background: "linear-gradient(to top, var(--color-void) 60%, transparent)" }}
          >
            <QuestionStats q={q} picked={g.locked ?? -1} />
            <NeonButton
              full
              variant={g.locked === q.correct ? "gold" : "ghost"}
              onClick={g.locked === q.correct ? showLadder : () => g.proceed()}
              className="mt-4 py-3 text-base font-bold"
            >
              {g.locked === q.correct ? t("game_continue") : t("results_ended")}
            </NeonButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prize ladder overlay — slides in from right on correct answer */}
      <AnimatePresence>
        {ladderVisible && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ x: "100%", transition: { duration: 0.6, ease: [0.64, 0, 0.78, 0] } }}
            className="absolute inset-0 z-40 overflow-hidden"
          >
            <motion.div className="absolute inset-0 bg-black/50 sm:bg-black/40" />
            <PrizeLadderOverlay rungIndex={g.rungIndex} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
