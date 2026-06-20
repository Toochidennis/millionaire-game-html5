import { useTranslation } from "react-i18next";
import { Sparkles, Flame, Crown, Globe, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = { Sparkles, Flame, Crown, Globe, Star };
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
        {p.achievements.map((a) => {
          const Icon = ACHIEVEMENT_ICONS[a.icon] ?? Star;
          return (
            <div key={a.id}>
              <GlassCard glow={rarityGlow[a.rarity]} className={cn("flex items-center gap-4 overflow-hidden", !a.unlocked && "opacity-60")}>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10"><Icon className="text-gold" /></span>
                <div className="flex-1 min-w-0">
                  <p className="display font-semibold break-words leading-snug">{a.title}</p>
                  <p className="text-xs text-muted break-words leading-snug mt-0.5">{a.description}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan to-violet" style={{ width: `${a.progress * 100}%` }} />
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-wide text-muted shrink-0">{t(`ach_${a.rarity}`)}</span>
              </GlassCard>
            </div>
          );
        })}
      </div>
    </PageTransition>
  );
}
