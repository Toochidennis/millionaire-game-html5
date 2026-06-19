import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Play, Swords, CalendarDays, Map, Trophy, Crown, Settings as Cog } from "lucide-react";
import { useUserStore } from "@/store";
import { useSettingsStore } from "@/store/useSettingsStore";
import { PageTransition } from "@/components/design/PageTransition";
import { GlassCard } from "@/components/design/GlassCard";
import { NeonButton } from "@/components/design/NeonButton";
import { Stat } from "@/components/design/Stat";
import { fmtCompact } from "@/lib/money";

export function Dashboard() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const p    = useUserStore((s) => s.profile);
  const pace = useSettingsStore((s) => s.pace);
  if (!p) { nav("/login"); return null; }

  const tiles = [
    { to: "/multiplayer", icon: Swords, label: t("dash_duel"), sub: t("dash_duelSub"), glow: "violet" as const },
    { to: "/daily", icon: CalendarDays, label: t("dash_daily"), sub: "Resets in 7h", glow: "cyan" as const },
    { to: "/journey", icon: Map, label: t("dash_journey"), sub: `Node ${p.journeyNode}`, glow: "none" as const },
    { to: "/season", icon: Crown, label: t("dash_season"), sub: t("season_tier", { n: p.seasonTier }), glow: "gold" as const },
  ];

  return (
    <PageTransition className="h-dvh flex flex-col px-4 pt-6 pb-24 sm:px-6 max-w-2xl mx-auto w-full">
      <header className="shrink-0 flex items-center justify-between mb-4">
        <div>
          <p className="text-muted text-sm">{t("dash_welcome")}</p>
          <h1 className="display text-3xl font-bold">{p.name}</h1>
        </div>
        <button onClick={() => nav("/settings")} className="glass rounded-full p-3" aria-label="Settings">
          <Cog size={20} className="text-cyan" />
        </button>
      </header>

      <GlassCard glow="gold" className="shrink-0 mb-4 flex items-center justify-between gap-4 overflow-hidden" hi>
        <div className="min-w-0 flex-1">
          <p className="text-muted text-xs uppercase tracking-wide">
            {pace === "chill" ? t("st_chill") : t("st_classic")} · {pace === "chill" ? t("st_chill_hint") : t("st_classic_hint")}
          </p>
          <p className="display text-xl font-bold break-words">{t("dash_tagline")}</p>
        </div>
        <NeonButton variant="gold" onClick={() => nav("/game")} className="shrink-0">
          <span className="flex items-center gap-2"><Play size={18} /> {t("dash_play")}</span>
        </NeonButton>
      </GlassCard>

      <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-3 mb-4">
        {tiles.map((tile) => (
          <button key={tile.to} onClick={() => nav(tile.to)} className="h-full">
            <GlassCard glow={tile.glow} className="h-full text-start overflow-hidden">
              <tile.icon size={26} className="text-cyan mb-3 shrink-0" />
              <p className="display font-semibold break-words leading-snug">{tile.label}</p>
              <p className="text-xs text-muted mt-0.5 break-words leading-snug">{tile.sub}</p>
            </GlassCard>
          </button>
        ))}
      </div>

      <div className="shrink-0 grid grid-cols-3 gap-3 mb-3">
        <Stat label={t("stat_wallet")} value={fmtCompact(p.stats.wallet ?? 0)} accent />
        <Stat label={t("dash_level")} value={String(p.stats.level)} />
        <Stat label={t("dash_streak")} value={String(p.stats.longestStreak)} />
      </div>

      <button onClick={() => nav("/leaderboards")} className="shrink-0 w-full">
        <GlassCard className="flex items-center gap-3 overflow-hidden">
          <Trophy className="text-gold shrink-0" />
          <span className="min-w-0 flex-1 break-words text-start">{t("dash_rankings")}</span>
        </GlassCard>
      </button>
    </PageTransition>
  );
}
