import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { fmtMoney } from "@/lib/money";
import { READY_QUOTE_COUNT } from "@/lib/locales";

interface Props {
  level: number;
  prizeGoal: number;
  reducedMotion: boolean;
  onDone: () => void;
}

/**
 * Pre-game "Get Ready" interstitial: current level + prize goal, a motivational
 * quote, and an animated 3-2-1-GO countdown. Auto-advances via onDone.
 */
export function GetReady({ level, prizeGoal, reducedMotion, onDone }: Props) {
  const { t } = useTranslation();
  const [count, setCount] = useState<number | null>(null); // null = intro beat (no number yet)
  const [quoteN] = useState(() => Math.floor(Math.random() * READY_QUOTE_COUNT) + 1);

  useEffect(() => {
    const intro = reducedMotion ? 500 : 1000; // level/prize/quote settle first — no number
    const step  = reducedMotion ? 500 : 800;  // even beat: 3 · 2 · 1 · GO
    const timers = [
      setTimeout(() => setCount(3), intro),
      setTimeout(() => setCount(2), intro + step),
      setTimeout(() => setCount(1), intro + step * 2),
      setTimeout(() => setCount(0), intro + step * 3),
      setTimeout(onDone,            intro + step * 4),
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isGo = count === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeIn" } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between px-6 pt-[calc(5.5rem_+_env(safe-area-inset-top))] pb-[calc(3.5rem_+_env(safe-area-inset-bottom))] overflow-hidden select-none"
      style={{ background: "radial-gradient(ellipse 85% 60% at 50% 38%, #0e2247 0%, #070f20 68%, #04060d 100%)" }}
    >
      {/* breathing spotlight */}
      {!reducedMotion && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 55% 40% at 50% 45%, rgba(34,211,238,0.14) 0%, transparent 75%)" }}
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* ── Top zone: level + prize goal ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center gap-8 text-center"
      >
        <p className="text-sm font-bold uppercase tracking-[0.4em] text-cyan/80">
          {t("ready_get")}
        </p>
        <h1 className="display text-5xl font-black tracking-tight">
          {t("dash_level")} {level}
        </h1>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
            {t("ready_goal")}
          </span>
          <span className="nums text-4xl font-extrabold text-gold drop-shadow-[0_0_16px_rgba(234,179,8,0.55)]">
            {fmtMoney(prizeGoal)}
          </span>
        </div>
      </motion.div>

      {/* ── Center zone: countdown ── */}
      <div className="relative grid h-44 w-44 place-items-center">
        {/* expanding ring per tick */}
        {!reducedMotion && count !== null && (
          <motion.span
            key={`ring-${count}`}
            className="absolute rounded-full border-2"
            style={{ borderColor: isGo ? "rgba(234,179,8,0.7)" : "rgba(34,211,238,0.6)" }}
            initial={{ width: 70, height: 70, opacity: 0.8 }}
            animate={{ width: 180, height: 180, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )}
        <AnimatePresence mode="popLayout">
          {count !== null && (
            <motion.span
              key={count}
              initial={reducedMotion ? { opacity: 0 } : { scale: 1.9, opacity: 0, filter: "blur(8px)" }}
              animate={reducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={reducedMotion ? { opacity: 0 } : { scale: 0.4, opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={
                isGo
                  ? "display font-black text-7xl text-gold drop-shadow-[0_0_25px_rgba(234,179,8,0.7)]"
                  : "display font-black text-8xl text-ink drop-shadow-[0_0_20px_rgba(34,211,238,0.55)]"
              }
            >
              {isGo ? t("ready_go") : count}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom zone: motivational quote ── */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative max-w-sm text-center text-lg italic text-muted/90 leading-relaxed"
      >
        {t(`ready_quote_${quoteN}`)}
      </motion.p>
    </motion.div>
  );
}
