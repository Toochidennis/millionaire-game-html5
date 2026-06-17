import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Crown, Lock, Gift } from "lucide-react";
import { useUserStore } from "@/store";
import { PageTransition } from "@/components/design/PageTransition";
import { GlassCard } from "@/components/design/GlassCard";
import { NeonButton } from "@/components/design/NeonButton";
import { cn } from "@/lib/cn";

const TIERS = Array.from({ length: 10 }, (_, i) => i + 1);

export function SeasonPass() {
  const { t } = useTranslation();
  const p = useUserStore((s) => s.profile);
  const currentTier = p?.seasonTier ?? 1;
  return (
    <PageTransition>
      <GlassCard glow="gold" hi className="mb-5 flex items-center gap-3">
        <Crown className="text-gold" size={28} />
        <div>
          <h1 className="display text-2xl font-bold">{t("season_header")}</h1>
          <p className="text-xs text-muted">{t("season_daysLeft")}</p>
        </div>
        <NeonButton variant="gold" className="ml-auto px-4 py-2 text-sm">{t("season_premium")}</NeonButton>
      </GlassCard>

      <div className="flex gap-3 overflow-x-auto pb-3">
        {TIERS.map((tier, i) => {
          const owned = tier <= currentTier;
          return (
            <motion.div key={tier} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={cn("glass w-28 shrink-0 rounded-2xl p-3 text-center", owned ? "neon-cyan" : "opacity-60")}>
              <span className="nums text-xs text-muted">{t("season_tier", { n: tier })}</span>
              <div className="my-2 grid h-14 place-items-center rounded-xl bg-white/8">
                {owned ? <Gift className="text-gold" /> : <Lock className="text-muted" size={16} />}
              </div>
              <p className="text-[11px] text-muted">{owned ? t("season_claimed") : t("journey_locked")}</p>
            </motion.div>
          );
        })}
      </div>
    </PageTransition>
  );
}
