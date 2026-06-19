import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Crown, Home, RotateCcw } from "lucide-react";
import { useGameStore, useUserStore } from "@/store";
import { fmtMoney } from "@/lib/money";
import { PageTransition } from "@/components/design/PageTransition";
import { GlassCard } from "@/components/design/GlassCard";
import { NeonButton } from "@/components/design/NeonButton";

export function Results() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const { phase, winnings, streak, reset, rungIndex } = useGameStore();
  const record      = useUserStore((s) => s.recordResult);
  const addToWallet = useUserStore((s) => s.addToWallet);

  const won    = phase === "won";
  const amount = winnings();

  const committed = useRef(false);
  const commit = () => {
    if (committed.current) return;
    committed.current = true;
    record(amount, rungIndex, 15, streak, won);
    addToWallet(amount);
  };

  const title = won
    ? t("results_won")
    : phase === "walked"
    ? t("results_walked")
    : t("results_ended");

  return (
    <PageTransition>
      <div className="grid min-h-[80dvh] place-items-center text-center">
        <div className="w-full max-w-md">
          <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 10 }}
            className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-deep neon-gold">
            <Crown size={44} className="text-void" />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="display text-4xl font-bold text-gold text-glow">{title}</motion.h1>

          <GlassCard glow="gold" hi className="my-6 overflow-hidden">
            <p className="text-muted text-xs uppercase tracking-widest mb-2">{t("results_winnings")}</p>
            <motion.p
              className="nums font-bold text-gold break-all leading-none"
              style={{ fontSize: "clamp(2rem, 10vw, 3.5rem)" }}
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            >
              {fmtMoney(amount)}
            </motion.p>
            <p className="mt-3 text-sm text-muted">{t("results_streak", { count: streak })}</p>
          </GlassCard>

          <div className="flex flex-col gap-3 sm:flex-row">
            <NeonButton full variant="ghost" onClick={() => { commit(); reset(); nav("/dashboard"); }}>
              <span className="flex items-center justify-center gap-2 min-w-0">
                <Home size={18} className="shrink-0" />
                <span className="truncate">{t("results_home")}</span>
              </span>
            </NeonButton>
            <NeonButton full variant="gold" onClick={() => { commit(); reset(); nav("/game"); }}>
              <span className="flex items-center justify-center gap-2 min-w-0">
                <RotateCcw size={18} className="shrink-0" />
                <span className="truncate">{t("results_again")}</span>
              </span>
            </NeonButton>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
