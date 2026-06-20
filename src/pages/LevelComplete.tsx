import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Crown, Star, ChevronRight, Home } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { useUserStore } from "@/store/useUserStore";
import { LADDER, TOP_RUNG, fmtMoney, applyLevel } from "@/lib/money";
import { NeonButton } from "@/components/design/NeonButton";
import { Confetti } from "@/components/design/Confetti";

export function LevelComplete() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const g = useGameStore();
  const { profile, recordResult, setWallet, levelUp } = useUserStore();

  const levelAtWin = profile?.stats.level ?? 1;
  const basePrize  = LADDER[TOP_RUNG].amount;
  const totalPrize = applyLevel(basePrize, levelAtWin);
  const nextLevel  = levelAtWin + 1;

  const committed = useRef(false);
  const commit = () => {
    if (committed.current) return;
    committed.current = true;
    recordResult(totalPrize, 15, 15, g.streak, true);
    setWallet(totalPrize);
    levelUp();
    g.reset();
  };

  const handleContinue = () => { commit(); nav("/game"); };
  const handleHome     = () => { commit(); nav("/dashboard", { state: { showRank: true } }); };

  const ease = [0.22, 1, 0.36, 1] as const;
  const stagger = (i: number) => ({ initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 + i * 0.15, duration: 0.5, ease } });

  return (
    <div className="relative h-dvh flex flex-col items-center justify-center overflow-hidden px-6 select-none">
      <Confetti />

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm">
        {/* Crown icon */}
        <motion.div {...stagger(0)}>
          <motion.div
            animate={{ rotate: [0, -8, 8, -5, 5, 0], scale: [1, 1.1, 1] }}
            transition={{ delay: 0.8, duration: 0.8, ease: "easeInOut" }}
            className="w-24 h-24 rounded-full bg-gold/20 ring-2 ring-gold/50 flex items-center justify-center"
          >
            <Crown size={48} className="text-gold drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]" />
          </motion.div>
        </motion.div>

        {/* Level badge */}
        <motion.div {...stagger(1)} className="flex items-center gap-2">
          <span className="glass px-3 py-1 rounded-full text-xs font-bold text-muted uppercase tracking-widest">
            {t("lc_was_level", { n: levelAtWin })}
          </span>
          <ChevronRight size={14} className="text-gold" />
          <span className="glass px-3 py-1 rounded-full text-xs font-bold text-gold uppercase tracking-widest ring-1 ring-gold/40">
            {t("lc_new_level", { n: nextLevel })}
          </span>
        </motion.div>

        {/* Title */}
        <motion.div {...stagger(2)} className="text-center">
          <h1 className="display text-3xl font-black text-gold leading-none">
            {t("lc_title")}
          </h1>
          <p className="text-muted text-sm mt-1">
            {t("lc_sub", { n: levelAtWin })}
          </p>
        </motion.div>

        {/* Congrats + name */}
        <motion.p {...stagger(3)} className="text-center text-ink/80 text-base">
          {t("lc_congrats", { name: profile?.name ?? "Player" })}
        </motion.p>

        {/* Prize card */}
        <motion.div
          {...stagger(4)}
          className="w-full glass rounded-2xl p-5 text-center ring-1 ring-gold/30"
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Star size={14} className="text-gold fill-gold" />
            <span className="text-xs uppercase tracking-widest text-muted font-semibold">
              {t("lc_prize")}
            </span>
            <Star size={14} className="text-gold fill-gold" />
          </div>
          <p className="nums text-4xl font-black text-gold">
            {fmtMoney(totalPrize)}
          </p>
          {levelAtWin > 1 && (
            <p className="text-xs text-muted mt-1">
              {fmtMoney(basePrize)} × {levelAtWin}
            </p>
          )}
        </motion.div>

        {/* CTA buttons */}
        <motion.div {...stagger(5)} className="w-full flex flex-col gap-2.5">
          <NeonButton full variant="gold" onClick={handleContinue} className="py-3.5 text-base font-bold">
            {t("lc_next", { n: nextLevel })}
          </NeonButton>
          <button
            onClick={handleHome}
            className="flex items-center justify-center gap-1.5 text-sm text-muted hover:text-ink transition-colors py-2"
          >
            <Home size={14} />
            {t("lc_home")}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
