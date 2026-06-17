import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import * as Icons from "lucide-react";
import { useUserStore } from "@/store";
import { PageTransition } from "@/components/design/PageTransition";
import { GlassCard } from "@/components/design/GlassCard";
import { cn } from "@/lib/cn";

const rarityGlow = { common: "none", rare: "cyan", epic: "violet", legendary: "gold" } as const;

export function Achievements() {
  const { t } = useTranslation();
  const p = useUserStore((s) => s.profile);
  if (!p) return null;
  return (
    <PageTransition>
      <h1 className="display text-3xl font-bold mb-5">{t("ach_title")}</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {p.achievements.map((a, i) => {
          const Icon = (Icons as any)[a.icon] ?? Icons.Star;
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard glow={rarityGlow[a.rarity]} className={cn("flex items-center gap-4", !a.unlocked && "opacity-60")}>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10"><Icon className="text-gold" /></span>
                <div className="flex-1">
                  <p className="display font-semibold">{a.title}</p>
                  <p className="text-xs text-muted">{a.description}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan to-violet" style={{ width: `${a.progress * 100}%` }} />
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-wide text-muted">{t(`ach_${a.rarity}`)}</span>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </PageTransition>
  );
}
