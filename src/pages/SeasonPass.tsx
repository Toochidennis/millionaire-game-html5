import { useTranslation } from "react-i18next";
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
      <GlassCard glow="gold" hi className="mb-5 flex items-center gap-3 overflow-hidden">
        <Crown className="text-gold shrink-0" size={28} />
        <div className="min-w-0 flex-1">
          <h1 className="display text-xl font-bold break-words leading-tight">{t("season_header")}</h1>
          <p className="text-xs text-muted mt-0.5">{t("season_daysLeft")}</p>
        </div>
        <NeonButton variant="gold" className="ms-auto shrink-0 px-4 py-2 text-sm whitespace-nowrap">{t("season_premium")}</NeonButton>
      </GlassCard>

      <div className="flex gap-3 overflow-x-auto pb-3">
        {TIERS.map((tier) => {
          const owned = tier <= currentTier;
          return (
            <div key={tier}
              className={cn("glass w-28 shrink-0 rounded-2xl p-3 text-center", owned ? "neon-cyan" : "opacity-60")}>
              <span className="nums text-xs text-muted">{t("season_tier", { n: tier })}</span>
              <div className="my-2 grid h-14 place-items-center rounded-xl bg-white/8">
                {owned ? <Gift className="text-gold" /> : <Lock className="text-muted" size={16} />}
              </div>
              <p className="text-[11px] text-muted">{owned ? t("season_claimed") : t("journey_locked")}</p>
            </div>
          );
        })}
      </div>
    </PageTransition>
  );
}
