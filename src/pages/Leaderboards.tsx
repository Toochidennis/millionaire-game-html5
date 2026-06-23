import { useTranslation } from "react-i18next";
import { Trophy, Medal } from "lucide-react";
import { useLeaderboardStore, useUserStore } from "@/store";
import type { LeaderboardScope } from "@/types";
import { PageTransition } from "@/components/design/PageTransition";
import { GlassCard } from "@/components/design/GlassCard";
import { fmtMoney } from "@/lib/money";
import { cn } from "@/lib/cn";
import { countryInfo } from "@/lib/country";

const SCOPES: LeaderboardScope[] = ["global", "country", "season", "friends"];

const medal = (i: number) => {
  if (i === 0) return { icon: Trophy, cls: "text-gold" };
  if (i === 1) return { icon: Medal, cls: "text-muted" };
  if (i === 2) return { icon: Medal, cls: "text-gold-deep" };
  return null;
};

export function Leaderboards() {
  const { t } = useTranslation();
  const { scope, setScope, rows } = useLeaderboardStore();
  const cc = useUserStore((s) => s.profile?.countryCode ?? "NG");
  const data = rows(cc);

  return (
    <PageTransition>
      <h1 className="display text-3xl font-bold mb-4">{t("lb_title")}</h1>
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {SCOPES.map((id) => (
          <button key={id} onClick={() => setScope(id)}
            className={cn("rounded-full px-4 py-2 text-sm whitespace-nowrap",
              scope === id ? "bg-gradient-to-r from-cyan to-violet text-void neon-cyan" : "glass text-muted")}>
            {t(`lb_${id}`)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {data.map((r, i) => {
          const m = medal(i);
          const info = countryInfo(r.countryCode);
          return (
            <div key={r.rank}>
              <GlassCard glow={i < 3 ? "gold" : "none"} className="flex items-center gap-3 py-3 px-4">
                {/* Rank */}
                <span className={cn("nums w-7 text-center font-bold shrink-0", i < 3 ? "text-gold text-glow text-lg" : "text-muted text-sm")}>
                  {m ? <m.icon size={16} className={cn("mx-auto", m.cls)} /> : r.rank}
                </span>

                {/* Player info */}
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <img src={info.image} alt="" className="w-6 h-4 shrink-0 rounded-sm object-cover" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-snug truncate">{r.name}</p>
                    <p className="text-xs text-muted leading-snug truncate">{info.name}</p>
                  </div>
                </div>

                {/* Winnings */}
                <span className={cn("nums font-bold text-sm shrink-0", i < 3 ? "text-gold text-glow" : "text-gold")}>
                  {fmtMoney(r.winnings)}
                </span>
              </GlassCard>
            </div>
          );
        })}
      </div>
    </PageTransition>
  );
}
