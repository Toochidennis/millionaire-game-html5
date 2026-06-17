import { useEffect } from "react";
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
  const record = useUserStore((s) => s.recordResult);
  const won = phase === "won";
  const amount = winnings();

  useEffect(() => {
    record(amount, rungIndex, 15, streak, won);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

          <GlassCard glow="gold" hi className="my-6">
            <p className="text-muted text-xs uppercase tracking-wide">{t("results_winnings")}</p>
            <motion.p className="nums text-5xl font-bold text-gold"
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
              {fmtMoney(amount)}
            </motion.p>
            <p className="mt-2 text-sm text-muted">{t("results_streak", { count: streak })}</p>
          </GlassCard>

          <div className="flex gap-3">
            <NeonButton full variant="ghost" onClick={() => { reset(); nav("/dashboard"); }}>
              <span className="flex items-center justify-center gap-2"><Home size={18} /> {t("results_home")}</span>
            </NeonButton>
            <NeonButton full variant="gold" onClick={() => { reset(); nav("/game"); }}>
              <span className="flex items-center justify-center gap-2"><RotateCcw size={18} /> {t("results_again")}</span>
            </NeonButton>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
