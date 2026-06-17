import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { useLeaderboardStore, useUserStore } from "@/store";
import type { LeaderboardScope } from "@/types";
import { PageTransition } from "@/components/design/PageTransition";
import { GlassCard } from "@/components/design/GlassCard";
import { fmtMoney } from "@/lib/money";
import { cn } from "@/lib/cn";

const SCOPES: LeaderboardScope[] = ["global", "country", "season", "friends"];

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
        {data.map((r, i) => (
          <motion.div key={r.rank} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}>
            <GlassCard glow={i < 3 ? "gold" : "none"} className="flex items-center gap-3 py-3">
              <span className={cn("nums w-8 text-center font-bold", i < 3 ? "text-gold text-glow" : "text-muted")}>{r.rank}</span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-sm">{r.countryCode}</span>
              <span className="flex-1 font-medium">{r.name}</span>
              <span className="nums text-gold font-semibold">{fmtMoney(r.winnings)}</span>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </PageTransition>
  );
}
