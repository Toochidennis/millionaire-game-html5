import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarDays, Flame } from "lucide-react";
import { PageTransition } from "@/components/design/PageTransition";
import { GlassCard } from "@/components/design/GlassCard";
import { NeonButton } from "@/components/design/NeonButton";

export function DailyChallenge() {
  const nav = useNavigate();
  const { t } = useTranslation();
  return (
    <PageTransition>
      <h1 className="display text-3xl font-bold mb-5">{t("daily_title")}</h1>
      <GlassCard glow="cyan" hi className="text-center space-y-3 mb-4">
        <CalendarDays size={36} className="text-cyan mx-auto" />
        <p className="display text-xl font-semibold">{t("daily_curatedQs")}</p>
        <p className="text-muted text-sm">{t("daily_desc")}</p>
        <NeonButton onClick={() => nav("/game")}>{t("daily_start")}</NeonButton>
      </GlassCard>
      <GlassCard className="flex items-center gap-3">
        <Flame className="text-gold" />
        <div>
          <p className="font-semibold">{t("daily_streak")}</p>
          <p className="text-xs text-muted">{t("daily_streakSub")}</p>
        </div>
        <span className="ml-auto nums text-2xl font-bold text-gold">4</span>
      </GlassCard>
    </PageTransition>
  );
}
