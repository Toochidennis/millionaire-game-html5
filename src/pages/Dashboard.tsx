import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Play, Swords, CalendarDays, Map, Trophy, Crown, Settings as Cog } from "lucide-react";
import { useUserStore } from "@/store";
import { PageTransition } from "@/components/design/PageTransition";
import { GlassCard } from "@/components/design/GlassCard";
import { NeonButton } from "@/components/design/NeonButton";
import { Stat } from "@/components/design/Stat";
import { RankModal } from "@/components/game/RankModal";
import { fmtMoney } from "@/lib/money";

export function Dashboard() {
  const nav = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const p = useUserStore((s) => s.profile);
  const markReturning = useUserStore((s) => s.markReturning);

  // Show the post-game rank popup once, only when arriving via Home from an end screen.
  // Clear the nav state afterward so a refresh or re-navigation doesn't retrigger it.
  const [showRank, setShowRank] = useState(false);
  useEffect(() => {
    if (location.state?.showRank) {
      setShowRank(true);
      nav(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Snapshot the greeting per profile identity. Re-snapshots whenever profile.id
  // changes (new sign-in), so a new profile can never inherit a stale "Welcome back",
  // and it never flickers when the flag flips mid-view.
  const greetedIdRef   = useRef<string | null>(null);
  const isReturningRef = useRef(false);
  if (p && greetedIdRef.current !== p.id) {
    greetedIdRef.current = p.id;
    isReturningRef.current = !!p.returning;
  }
  const isReturning = isReturningRef.current;

  // First view of a fresh profile → flip the flag so next time says "Welcome back".
  useEffect(() => {
    if (p && !p.returning) markReturning();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p?.id]);

  if (!p) { nav("/login"); return null; }

  const tiles = [
    { to: "/multiplayer", icon: Swords, label: t("dash_duel"), sub: t("dash_duelSub"), glow: "violet" as const },
    { to: "/daily", icon: CalendarDays, label: t("dash_daily"), sub: "Resets in 7h", glow: "cyan" as const },
    { to: "/journey", icon: Map, label: t("dash_journey"), sub: `Node ${p.journeyNode}`, glow: "none" as const },
    { to: "/season", icon: Crown, label: t("dash_season"), sub: t("season_tier", { n: p.seasonTier }), glow: "gold" as const },
  ];

  return (
    <PageTransition>
      {showRank && <RankModal winnings={p.stats.bestWinnings} delay={400} />}
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted text-sm">{isReturning ? t("dash_welcome") : t("dash_welcome_new")}</p>
          <h1 className="display text-3xl font-bold">{p.name}</h1>
        </div>
        <button onClick={() => nav("/settings")} className="glass rounded-full p-3" aria-label="Settings">
          <Cog size={20} className="text-cyan" />
        </button>
      </header>

      <GlassCard glow="gold" className="mb-6 flex items-center justify-between" hi>
        <div>
          <p className="text-muted text-xs uppercase tracking-wide">{t("dash_classic")}</p>
          <p className="display text-xl font-bold">{t("dash_tagline")}</p>
        </div>
        <NeonButton variant="gold" onClick={() => nav("/game")}>
          <span className="flex items-center gap-2"><Play size={18} /> {t("dash_play")}</span>
        </NeonButton>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {tiles.map((tile, i) => (
          <motion.button key={tile.to} onClick={() => nav(tile.to)}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <GlassCard glow={tile.glow} className="h-full text-left">
              <tile.icon size={26} className="text-cyan mb-3" />
              <p className="display font-semibold">{tile.label}</p>
              <p className="text-xs text-muted">{tile.sub}</p>
            </GlassCard>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label={t("dash_bestWin")} value={fmtMoney(p.stats.bestWinnings)} accent />
        <Stat label={t("dash_level")} value={String(p.stats.level)} />
        <Stat label={t("dash_streak")} value={String(p.stats.longestStreak)} />
      </div>

      <button onClick={() => nav("/leaderboards")} className="mt-4 w-full">
        <GlassCard className="flex items-center gap-3">
          <Trophy className="text-gold" />
          <span>{t("dash_rankings")}</span>
        </GlassCard>
      </button>
    </PageTransition>
  );
}
