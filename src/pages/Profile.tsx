import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Award, LogOut } from "lucide-react";
import { useUserStore } from "@/store";
import { PageTransition } from "@/components/design/PageTransition";
import { GlassCard } from "@/components/design/GlassCard";
import { Stat } from "@/components/design/Stat";
import { NeonButton } from "@/components/design/NeonButton";
import { fmtMoney } from "@/lib/money";

export function Profile() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const { profile: p, logout } = useUserStore();
  if (!p) { nav("/login"); return null; }
  const acc = p.stats.totalAnswered ? Math.round((p.stats.totalCorrect / p.stats.totalAnswered) * 100) : 0;
  const unlocked = p.achievements.filter((a) => a.unlocked).length;

  return (
    <PageTransition>
      <GlassCard glow="violet" hi className="flex items-center gap-4 mb-6">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-cyan to-violet text-3xl">{p.avatar}</span>
        <div>
          <h1 className="display text-2xl font-bold">{p.name}</h1>
          <p className="text-muted text-sm">
            {p.countryCode} · {t("prof_level", { n: p.stats.level })} · {p.guest ? t("prof_guest") : t("prof_member")}
          </p>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Stat label={t("prof_games")} value={String(p.stats.gamesPlayed)} />
        <Stat label={t("prof_accuracy")} value={`${acc}%`} accent />
        <Stat label={t("prof_bestWin")} value={fmtMoney(p.stats.bestWinnings)} />
        <Stat label={t("prof_perfect")} value={String(p.stats.perfectGames)} />
      </div>

      <button onClick={() => nav("/achievements")} className="w-full mb-3">
        <GlassCard className="flex items-center gap-3"><Award className="text-gold" />
          <span>{t("prof_achievements")}</span>
          <span className="ml-auto nums text-muted">{unlocked}/{p.achievements.length}</span>
        </GlassCard>
      </button>

      <NeonButton full variant="ghost" onClick={() => { logout(); nav("/login"); }}>
        <span className="flex items-center justify-center gap-2"><LogOut size={18} /> {t("prof_signOut")}</span>
      </NeonButton>
    </PageTransition>
  );
}
