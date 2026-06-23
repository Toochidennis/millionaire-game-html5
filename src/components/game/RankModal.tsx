import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { X, Trophy } from "lucide-react";
import { useUserStore } from "@/store";
import { countryInfo } from "@/lib/country";
import { getMyRank, type RankResult } from "@/lib/rank";

/**
 * Post-game popup: shows the player's country rank. Self-contained — drop it on any
 * end screen. Fetches via getMyRank (mock now, API-ready), then opens after a short
 * beat so it doesn't collide with the screen's entrance animation.
 */
export function RankModal({ winnings, delay = 900 }: { winnings: number; delay?: number }) {
  const { t } = useTranslation();
  const profile = useUserStore((s) => s.profile);
  const [info, setInfo] = useState<RankResult | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!profile) return;
    let live = true;
    let timer: ReturnType<typeof setTimeout>;
    getMyRank({ countryCode: profile.countryCode, winnings }).then((r) => {
      if (!live) return;
      setInfo(r);
      timer = setTimeout(() => live && setOpen(true), delay);
    });
    return () => { live = false; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.countryCode, winnings]);

  if (!profile || !info) return null;
  const country = countryInfo(profile.countryCode).name;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* backdrop — tap to close */}
          <motion.div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />

          <motion.div
            className="relative w-full max-w-sm"
            initial={{ scale: 0.85, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1, transition: { type: "spring", stiffness: 220, damping: 20 } }}
            exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
          >
            <div
              className="relative overflow-hidden rounded-3xl p-7 text-center ring-1 ring-gold/30"
              style={{ background: "linear-gradient(160deg,#16203f,#0c1226)" }}
            >
              {/* close */}
              <button
                onClick={() => setOpen(false)}
                aria-label={t("rank_close")}
                className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-white/8 text-muted hover:text-ink hover:bg-white/15 transition active:scale-90"
              >
                <X size={16} />
              </button>

              {/* trophy */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0, transition: { delay: 0.1, type: "spring", stiffness: 200, damping: 12 } }}
                className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-gold/15 ring-2 ring-gold/40"
              >
                <Trophy size={30} className="text-gold drop-shadow-[0_0_10px_rgba(234,179,8,0.7)]" />
              </motion.div>

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
                {t("rank_title")}
              </p>

              <p className="mt-3 text-lg leading-relaxed text-ink/90">
                {t("rank_body", { rank: info.rank, country })}
              </p>

              <p className="mt-2 text-xs text-muted">
                {t("rank_players", { total: info.total })}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
