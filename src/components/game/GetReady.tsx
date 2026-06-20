import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { Crown, Trophy } from "lucide-react";
import { fmtMoney } from "@/lib/money";
import { READY_QUOTE_COUNT } from "@/lib/locales";

interface Props {
  level: number;
  prizeGoal: number;
  reducedMotion: boolean;
  onDone: () => void;
}

/** rAF count-up; jumps straight to the target when motion is reduced. */
function useCountUp(target: number, durationMs: number, animated: boolean) {
  const [val, setVal] = useState(animated ? 0 : target);
  useEffect(() => {
    if (!animated) { setVal(target); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3)))); // easeOutCubic
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, animated]);
  return val;
}

/**
 * Pre-game "Get Ready" interstitial: a level medallion, the prize goal counting
 * up, a motivational punch line, and an animated 3-2-1-GO countdown.
 * Auto-advances via onDone.
 */
export function GetReady({ level, prizeGoal, reducedMotion, onDone }: Props) {
  const { t } = useTranslation();
  const [count, setCount] = useState<number | null>(null); // null = intro beat (no number yet)
  const [quoteN] = useState(() => Math.floor(Math.random() * READY_QUOTE_COUNT) + 1);
  const animated = !reducedMotion;

  const intro = reducedMotion ? 500 : 1000; // level/prize/quote settle first — no number
  const step  = reducedMotion ? 500 : 800;  // even beat: 3 · 2 · 1 · GO

  const prize = useCountUp(prizeGoal, intro + step, animated);

  // Drifting spark particles — purely decorative, skipped under reduced motion.
  const sparks = useMemo(
    () =>
      Array.from({ length: 14 }, () => ({
        x: Math.random() * 100,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 4,
        dur: 4 + Math.random() * 4,
        gold: Math.random() > 0.5,
      })),
    [],
  );

  useEffect(() => {
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
      className="fixed inset-0 z-50 flex flex-col items-center justify-between px-6 pt-[calc(4.5rem_+_env(safe-area-inset-top))] pb-[calc(3rem_+_env(safe-area-inset-bottom))] overflow-hidden select-none"
      style={{ background: "radial-gradient(ellipse 85% 60% at 50% 38%, #0e2247 0%, #070f20 68%, #04060d 100%)" }}
    >
      {/* breathing spotlight */}
      {animated && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 55% 40% at 50% 45%, rgba(34,211,238,0.14) 0%, transparent 75%)" }}
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* drifting sparks */}
      {animated && sparks.map((s, i) => (
        <motion.span
          key={i}
          className="absolute bottom-0 rounded-full pointer-events-none"
          style={{
            left: `${s.x}%`,
            width: s.size,
            height: s.size,
            background: s.gold ? "rgba(255,209,102,0.8)" : "rgba(34,211,238,0.7)",
            boxShadow: s.gold ? "0 0 8px rgba(255,209,102,0.7)" : "0 0 8px rgba(34,211,238,0.6)",
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: "-105vh", opacity: [0, 1, 1, 0] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* ── Top zone: level medallion + prize goal + ladder ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center gap-6 text-center"
      >
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.4em] text-cyan/80">
          {animated && (
            <motion.span
              className="inline-block h-1.5 w-1.5 rounded-full bg-cyan"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
          )}
          {t("ready_get")}
        </p>

        {/* level medallion */}
        <div className="relative grid h-28 w-28 place-items-center">
          {animated && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, transparent, rgba(34,211,238,0.9), transparent 55%, rgba(168,85,247,0.7), transparent)",
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            />
          )}
          <div className="glass-hi neon-cyan grid h-[6.25rem] w-[6.25rem] place-items-center rounded-full">
            <Crown className="absolute top-4 h-4 w-4 text-gold drop-shadow-[0_0_8px_rgba(255,209,102,0.7)]" />
            <span className="display text-5xl font-black leading-none text-ink drop-shadow-[0_0_18px_rgba(34,211,238,0.5)]">
              {level}
            </span>
          </div>
        </div>
        <p className="-mt-3 text-xs font-bold uppercase tracking-[0.35em] text-muted">
          {t("dash_level")} {level}
        </p>

        {/* prize goal — counts up */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-muted">
            <Trophy className="h-3.5 w-3.5 text-gold" />
            {t("ready_goal")}
          </span>
          <span className="nums text-4xl font-extrabold text-gold drop-shadow-[0_0_16px_rgba(255,209,102,0.55)]">
            {fmtMoney(prize)}
          </span>
        </div>
      </motion.div>

      {/* ── Center zone: countdown ── */}
      <div className="relative grid h-44 w-44 place-items-center">
        {/* sweeping progress ring per tick */}
        {animated && count !== null && (
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
            <motion.circle
              key={`sweep-${count}`}
              cx="50" cy="50" r="46" fill="none"
              stroke={isGo ? "#ffd166" : "#22d3ee"}
              strokeWidth="3" strokeLinecap="round"
              initial={{ pathLength: 1 }}
              animate={{ pathLength: isGo ? 1 : 0 }}
              transition={{ duration: step / 1000, ease: "linear" }}
            />
          </svg>
        )}
        {/* expanding ring per tick */}
        {animated && count !== null && (
          <motion.span
            key={`ring-${count}`}
            className="absolute rounded-full border-2"
            style={{ borderColor: isGo ? "rgba(255,209,102,0.7)" : "rgba(34,211,238,0.6)" }}
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
                  ? "display font-black text-7xl text-gold drop-shadow-[0_0_25px_rgba(255,209,102,0.7)]"
                  : "display font-black text-8xl text-ink drop-shadow-[0_0_20px_rgba(34,211,238,0.55)]"
              }
            >
              {isGo ? t("ready_go") : count}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom zone: motivational punch line ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative flex max-w-sm flex-col items-center gap-3 text-center"
      >
        <span className="display text-3xl leading-none text-cyan/40">&ldquo;</span>
        <p className="-mt-4 text-lg italic text-ink/90 leading-relaxed">
          {t(`ready_quote_${quoteN}`)}
        </p>
        <span className="h-px w-12 bg-gradient-to-r from-transparent via-cyan/70 to-transparent" />
      </motion.div>
    </motion.div>
  );
}
