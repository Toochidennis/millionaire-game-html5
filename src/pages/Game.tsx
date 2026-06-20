import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "motion/react";
import { useGameStore, useSettingsStore, useUserStore } from "@/store";
import { loadQuestionBank, getTotalLevels, loadSeenIds, markSeen } from "@/lib/questions";
import { fmtMoney, safeHavenFloor, applyLevel, LADDER, TOP_RUNG } from "@/lib/money";
import type { Question } from "@/types";
import { NeonButton } from "@/components/design/NeonButton";
import { GlassCard } from "@/components/design/GlassCard";
import { Timer } from "@/components/game/Timer";
import { AnswerOption } from "@/components/game/AnswerOption";
import { Lifelines } from "@/components/game/Lifelines";
import { HostBubble } from "@/components/game/HostBubble";
import { QuestionStats } from "@/components/game/QuestionStats";
import { PrizeLadderOverlay } from "@/components/game/PrizeLadderOverlay";
import { GetReady } from "@/components/game/GetReady";

export function Game() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const g = useGameStore();
  const hostVoice  = useSettingsStore((s) => s.hostVoice);
  const pace       = useSettingsStore((s) => s.pace);
  const language   = useSettingsStore((s) => s.language);
  const reducedMotion  = useSettingsStore((s) => s.reducedMotion);
  const setTotalLevels = useSettingsStore((s) => s.setTotalLevels);
  const playerLevel = useUserStore((s) => s.profile?.stats.level ?? 1);

  const [ladderVisible, setLadderVisible] = useState(false);
  const [continuing, setContinuing] = useState(false);       // latched on Continue tap; locks stats card out
  const [countdownDone, setCountdownDone] = useState(false); // 3-2-1-GO finished
  const [started, setStarted] = useState(false);             // match actually began
  const [loaded, setLoaded] = useState<{ bank: Question[]; seen: Set<string> } | null>(null);
  const startedRef = useRef(false);
  const hideTimerRef    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const proceedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Prize goal at the player's current level (top prize scaled by level).
  const prizeGoal = applyLevel(LADDER[TOP_RUNG].amount, playerLevel);

  useEffect(() => () => {
    clearTimeout(hideTimerRef.current);
    clearTimeout(proceedTimerRef.current);
  }, []);

  const showLadder = () => {
    if (continuing) return;            // guard double-taps
    setContinuing(true);              // latch: stats card slides out once and stays out
    setLadderVisible(true);
    hideTimerRef.current    = setTimeout(() => setLadderVisible(false), 1900); // hold, then slide out (0.6s)
    proceedTimerRef.current = setTimeout(() => g.proceed(),             2100); // fires as the slide-out completes
  };

  // Load the bank during the countdown — don't start the match yet.
  useEffect(() => {
    let live = true;
    Promise.all([loadQuestionBank(language), loadSeenIds(language)]).then(([bank, seen]) => {
      if (!live) return;
      setTotalLevels(getTotalLevels(bank));
      setLoaded({ bank, seen });
    });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Begin the match once the countdown is done AND the bank is ready (exactly once).
  // The overlay holds until `started` flips, so GO never reveals a blank screen.
  useEffect(() => {
    if (!countdownDone || !loaded || startedRef.current) return;
    startedRef.current = true;
    g.start("classic", loaded.bank, pace, loaded.seen);
    setStarted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdownDone, loaded]);

  useEffect(() => {
    const id = setInterval(() => g.tick(), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (g.phase === "asking") setContinuing(false); // next question is up — release the latch
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

  const optState = (i: number) => {
    if (!q) return "idle" as const;
    if (g.eliminated.includes(i)) return "eliminated" as const;
    if (g.phase === "revealing" || g.phase === "stats") {
      if (i === q.correct) return "correct" as const;
      if (i === g.locked)  return "wrong"   as const;
    }
    if (g.locked === i || g.selected === i) return "selected" as const;
    return "idle" as const;
  };

  return (
    <>
      {/* Get Ready countdown — gates every entry into gameplay; holds until the match starts */}
      <AnimatePresence>
        {!started && (
          <GetReady
            level={playerLevel}
            prizeGoal={prizeGoal}
            reducedMotion={reducedMotion}
            onDone={() => setCountdownDone(true)}
          />
        )}
      </AnimatePresence>

      {started && q && (
    <div className="h-dvh flex flex-col gap-[30px] overflow-hidden px-4 pt-[calc(0.75rem_+_env(safe-area-inset-top))] pb-[calc(0.5rem_+_env(safe-area-inset-bottom))] sm:px-6 max-w-2xl mx-auto w-full select-none relative">
      {/* HUD */}
      <div className="flex items-center justify-between shrink-0">
        <span className="glass rounded-2xl px-3 py-1.5 nums text-gold font-semibold text-sm">
          {fmtMoney(g.rungIndex > 0 ? safeHavenFloor(g.rungIndex) : 0)} {t("game_safe")}
        </span>
        <span className="nums text-muted text-sm">{t("game_qOf", { n: g.rungIndex + 1 })}</span>
        <NeonButton variant="ghost" onClick={() => g.walkAway()} className="px-3 py-1.5 text-sm">
          {t("game_walk")}
        </NeonButton>
      </div>

      {/* Timer — classic only; in chill mode it's omitted so the layout reclaims the space */}
      {pace === "classic" && (
        <div className="shrink-0">
          <Timer seconds={g.timeLeft} frozen={g.timeFrozen} />
        </div>
      )}

      {/* Body */}
      <div className={`flex-1 flex flex-col min-h-0 ${g.hostMessage ? "gap-5" : "gap-[30px]"}`}>
        {g.hostMessage && <HostBubble message={g.hostMessage} crowdVotes={g.crowdVotes} />}

        {/* Question card — Millionaire-style "box snaps open" reveal */}
        <div className="relative shrink-0">
          <motion.div
            key={q.id}
            initial={reducedMotion ? { opacity: 0 } : { scaleX: 0.04, opacity: 0 }}
            animate={
              reducedMotion
                ? { opacity: 1, transition: { duration: 0.2 } }
                : { scaleX: [0.04, 1.025, 1], opacity: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], times: [0, 0.7, 1] } }
            }
            style={{ transformOrigin: "center" }}
          >
            <GlassCard glow="cyan" className="relative overflow-hidden !p-4 !rounded-xl min-h-28 grid place-items-center">
              {/* cyan edge flash as the box locks open */}
              {!reducedMotion && (
                <motion.div
                  key={`flash-${q.id}`}
                  className="absolute inset-0 pointer-events-none rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.9, 0] }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.28 }}
                  style={{ boxShadow: "inset 0 0 0 1.5px rgba(34,211,238,0.9), inset 0 0 22px rgba(34,211,238,0.45)" }}
                />
              )}
              {/* light sweep across the glass */}
              {!reducedMotion && (
                <motion.div
                  key={`sweep-${q.id}`}
                  className="absolute inset-0 pointer-events-none"
                  initial={{ x: "-130%" }}
                  animate={{ x: "130%" }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.35 }}
                  style={{ background: "linear-gradient(105deg, transparent 38%, rgba(34,211,238,0.22) 50%, transparent 62%)" }}
                />
              )}

              {/* question text settles in once the box is open */}
              <motion.h2
                className="relative display text-lg sm:text-xl font-semibold leading-snug text-center"
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={
                  reducedMotion
                    ? { opacity: 1, transition: { duration: 0.25, delay: 0.15 } }
                    : { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.32 } }
                }
              >
                {q.prompt}
              </motion.h2>
            </GlassCard>
          </motion.div>
        </div>

        {/* Lifelines */}
        <div className="shrink-0">
          <Lifelines available={g.lifelines} onUse={(id) => g.useLifeline(id, hostVoice)} pace={pace} />
        </div>

        {/* Answer grid — cascades in A→B→C→D after the question locks open */}
        <div className="flex-1 flex flex-col justify-start min-h-0">
          <div className="grid gap-[10px] sm:grid-cols-2">
            {q.options.map((opt, i) => (
              <motion.div
                key={`${q.id}-${i}`}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
                animate={
                  reducedMotion
                    ? { opacity: 1, transition: { duration: 0.2, delay: 0.4 + i * 0.05 } }
                    : { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.55 + i * 0.12 } }
                }
              >
                <AnswerOption label={"ABCD"[i]} text={opt} state={optState(i)}
                  onClick={() => g.select(i)} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats overlay — Continue/X live inside the card; correct → ladder, wrong → results */}
      <AnimatePresence>
        {g.phase === "stats" && !continuing && (
          <motion.div
            initial={{ y: "120%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "120%", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
            className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] pt-2 sm:px-6"
            style={{ background: "linear-gradient(to top, var(--color-void) 60%, transparent)" }}
          >
            <QuestionStats
              q={q}
              picked={g.locked ?? -1}
              onContinue={g.locked === q.correct ? showLadder : () => g.proceed()}
            />
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
      )}
    </>
  );
}
