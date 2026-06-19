import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Award, LogOut, Check, RefreshCw } from "lucide-react";
import { User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useUserStore } from "@/store";
import { PageTransition } from "@/components/design/PageTransition";
import { GlassCard } from "@/components/design/GlassCard";
import { Stat } from "@/components/design/Stat";
import { NeonButton } from "@/components/design/NeonButton";
import { fmtMoney } from "@/lib/money";
import { countryInfo } from "@/lib/country";

export const AVATAR_OPTIONS: { id: string; from: string; to: string }[] = [
  { id: "0", from: "var(--color-cyan)",    to: "var(--color-violet)" },
  { id: "1", from: "#f43f5e",              to: "#f97316" },
  { id: "2", from: "#10b981",              to: "#06b6d4" },
  { id: "3", from: "#8b5cf6",              to: "#ec4899" },
  { id: "4", from: "#3b82f6",              to: "#6366f1" },
  { id: "5", from: "#f59e0b",              to: "#f97316" },
  { id: "6", from: "#ef4444",              to: "#f43f5e" },
  { id: "7", from: "#14b8a6",              to: "#22c55e" },
];

export function AvatarBubble({ avatarId, size = 80 }: { avatarId: string; size?: number }) {
  const opt = AVATAR_OPTIONS.find((a) => a.id === avatarId) ?? AVATAR_OPTIONS[0];
  return (
    <div
      className="rounded-full grid place-items-center shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${opt.from}, ${opt.to})`,
      }}
    >
      <User size={Math.round(size * 0.38)} className="text-white/80" />
    </div>
  );
}

export function Profile() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const { profile: p, setAvatar, logout } = useUserStore();
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!p) { nav("/login"); return null; }

  const acc = p.stats.totalAnswered ? Math.round((p.stats.totalCorrect / p.stats.totalAnswered) * 100) : 0;
  const unlocked = p.achievements.filter((a) => a.unlocked).length;

  return (
    <PageTransition>
      {/* Profile header */}
      <GlassCard glow="violet" hi className="flex items-center gap-4 mb-6 overflow-hidden">
        <button
          onClick={() => setPickerOpen(true)}
          className="relative shrink-0 active:scale-95 transition-transform"
          aria-label={t("prof_av_title")}
        >
          <AvatarBubble avatarId={p.avatar} size={80} />
          <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/40 backdrop-blur-sm grid place-items-center">
            <RefreshCw size={10} strokeWidth={2.5} className="text-white/90" />
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="display text-2xl font-bold break-words leading-tight">{p.name}</h1>
          <p className="text-muted text-sm break-words mt-0.5">
            <img src={countryInfo(p.countryCode).image} alt="" className="w-5 h-3.5 shrink-0 rounded-sm object-cover inline-block" />
            {" "}{countryInfo(p.countryCode).name} · {t("prof_level", { n: p.stats.level })} · {p.guest ? t("prof_guest") : t("prof_member")}
          </p>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Stat label={t("prof_games")} value={String(p.stats.gamesPlayed)} />
        <Stat label={t("prof_accuracy")} value={`${acc}%`} accent />
        <Stat label={t("stat_wallet")} value={fmtMoney(p.stats.wallet ?? 0)} accent />
        <Stat label={t("prof_perfect")} value={String(p.stats.perfectGames)} />
      </div>

      <button onClick={() => nav("/achievements")} className="w-full mb-3">
        <GlassCard className="flex items-center gap-3 overflow-hidden">
          <Award className="text-gold shrink-0" />
          <span className="min-w-0 flex-1 break-words text-start">{t("prof_achievements")}</span>
          <span className="ms-auto nums text-muted shrink-0">{unlocked}/{p.achievements.length}</span>
        </GlassCard>
      </button>

      <NeonButton full variant="ghost" onClick={() => { logout(); nav("/login"); }}>
        <span className="flex items-center justify-center gap-2"><LogOut size={18} /> {t("prof_signOut")}</span>
      </NeonButton>

      {/* ── Avatar Picker Sheet ── */}
      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-void/70 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPickerOpen(false)}
          >
            <motion.div
              className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto rounded-t-3xl overflow-hidden border border-white/10"
              style={{ background: "linear-gradient(160deg,#1a2240,#111830)" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              <p className="text-center font-bold text-base pt-2 pb-4">{t("prof_av_title")}</p>

              <div className="grid grid-cols-4 gap-4 px-6 pb-4">
                {AVATAR_OPTIONS.map((opt) => {
                  const active = p.avatar === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => { setAvatar(opt.id); setPickerOpen(false); }}
                      className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
                      aria-pressed={active}
                    >
                      <div className="relative">
                        <AvatarBubble avatarId={opt.id} size={64} />
                        {active && (
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-cyan grid place-items-center">
                            <Check size={11} strokeWidth={3} className="text-void" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-xs text-muted pb-6 px-6">{t("prof_av_coming")}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
