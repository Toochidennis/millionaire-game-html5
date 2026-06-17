import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Lock, Star } from "lucide-react";
import { useUserStore } from "@/store";
import { PageTransition } from "@/components/design/PageTransition";
import { cn } from "@/lib/cn";

const NODES = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, label: `Stage ${i + 1}` }));

export function JourneyMap() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const node = useUserStore((s) => s.profile?.journeyNode ?? 1);

  return (
    <PageTransition>
      <h1 className="display text-3xl font-bold mb-5">{t("journey_title")}</h1>
      <div className="relative mx-auto max-w-sm">
        {NODES.map((n, i) => {
          const unlocked = n.id <= node;
          const current = n.id === node;
          return (
            <motion.button key={n.id} disabled={!unlocked} onClick={() => nav("/game")}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className={cn("relative flex w-full items-center gap-4 py-4", i % 2 ? "flex-row-reverse text-right" : "")}>
              <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl",
                current ? "bg-gradient-to-br from-gold to-gold-deep neon-gold" :
                unlocked ? "glass-hi neon-cyan" : "glass opacity-50")}>
                {unlocked ? <Star className="text-void" /> : <Lock className="text-muted" size={18} />}
              </span>
              <div className={cn("glass rounded-2xl px-4 py-2 flex-1", !unlocked && "opacity-50")}>
                <p className="display font-semibold">{n.label}</p>
                <p className="text-xs text-muted">{unlocked ? t("journey_tapToPlay") : t("journey_locked")}</p>
              </div>
            </motion.button>
          );
        })}
        <div className="absolute left-1/2 top-0 -z-10 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-cyan via-violet to-gold opacity-30" />
      </div>
    </PageTransition>
  );
}
