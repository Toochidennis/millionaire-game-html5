import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { User, Zap, Users, Star, Sparkles, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useUserStore } from "@/store";
import { useSettingsStore } from "@/store/useSettingsStore";
import { loadQuestionBank } from "@/lib/questions";
import { PageTransition } from "@/components/design/PageTransition";
import { GlassCard } from "@/components/design/GlassCard";
import { CountryPicker } from "@/components/design/CountryPicker";

const FEATURES: { icon: LucideIcon; titleKey: string; subKey: string; color: string }[] = [
  { icon: Zap,   titleKey: "login_feature_1", subKey: "login_feature_1_sub", color: "var(--color-cyan)" },
  { icon: Users, titleKey: "login_feature_2", subKey: "login_feature_2_sub", color: "var(--color-violet)" },
  { icon: Star,  titleKey: "login_feature_3", subKey: "login_feature_3_sub", color: "#facc15" },
];

export function Login() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const { loginGuest, loginNamed } = useUserStore();
  const language = useSettingsStore((s) => s.language);
  const [name, setName] = useState("");
  const [cc, setCc] = useState("NG");
  const [featureIdx, setFeatureIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFeatureIdx((i) => (i + 1) % FEATURES.length), 2200);
    return () => clearInterval(id);
  }, []);

  const go = (named: boolean) => {
    named && name.trim() ? loginNamed(name.trim(), cc) : loginGuest(cc);
    loadQuestionBank(language); // fire-and-forget prefetch — ready by the time user taps Play
    nav("/dashboard");
  };

  const feat = FEATURES[featureIdx];
  const FeatIcon = feat.icon;

  return (
    <PageTransition className="h-dvh overflow-hidden w-full flex flex-col">
      <div className="flex flex-col flex-1 min-h-0">

        {/* ── Hero ── */}
        <div className="relative flex flex-col items-center gap-1 pt-[calc(1.25rem_+_env(safe-area-inset-top))] pb-3 px-6 text-center shrink-0">
          <motion.span
            className="absolute right-5 top-4 text-2xl font-black select-none pointer-events-none"
            style={{ color: "var(--color-violet)", opacity: 0.4 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            ?
          </motion.span>

          <motion.div
            className="text-3xl"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
          >
            🏆
          </motion.div>

          <motion.h1
            className="text-2xl font-black tracking-tight leading-tight"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Take{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(to right, var(--color-cyan), var(--color-violet))" }}
            >
              the stage
            </span>
          </motion.h1>

          <motion.p
            className="text-[11px] text-muted"
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.16 }}
          >
            {t("login_subtitle")}
          </motion.p>
        </div>

        {/* ── Form card ── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-7 pb-3">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.22 }}
          >
            <GlassCard glow="violet" className="!p-4 space-y-3">

              {/* Display name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted uppercase tracking-widest block">
                  {t("login_name")}
                </label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("login_placeholder_name")}
                    className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-cyan/40 focus:bg-white/8 transition-colors"
                  />
                </div>
              </div>

              {/* Region */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted uppercase tracking-widest block">
                  {t("login_label_region")}
                </label>
                <CountryPicker value={cc} onChange={setCc} />
              </div>

              {/* Primary CTA */}
              <button
                onClick={() => go(true)}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold text-sm text-white active:scale-[0.98] transition-transform"
                style={{ backgroundImage: "linear-gradient(to right, var(--color-cyan), var(--color-violet))" }}
              >
                <Sparkles size={15} className="shrink-0" />
                <span className="flex-1 text-center">{t("login_enter")}</span>
                <ChevronRight size={15} className="shrink-0" />
              </button>

              {/* Guest */}
              <button
                onClick={() => go(false)}
                className="w-full py-2.5 rounded-xl text-sm text-muted hover:text-ink font-medium bg-white/4 hover:bg-white/8 active:scale-[0.98] transition-all"
              >
                {t("login_guest")}
              </button>

            </GlassCard>
          </motion.div>
        </div>

        {/* ── Feature bar — cycling ── */}
        <motion.div
          className="flex flex-col items-center gap-2 px-4 pt-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] border-t border-white/5 shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="h-9 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={featureIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex items-center gap-2.5"
              >
                <span style={{ color: feat.color }} className="shrink-0">
                  <FeatIcon size={15} />
                </span>
                <div>
                  <p className="text-[11px] font-semibold leading-tight">{t(feat.titleKey)}</p>
                  <p className="text-[10px] text-muted leading-tight">{t(feat.subKey)}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot indicators */}
          <div className="flex gap-1.5 items-center">
            {FEATURES.map((_, i) => (
              <span
                key={i}
                className="block rounded-full transition-all duration-300"
                style={{
                  width: featureIdx === i ? 14 : 4,
                  height: 4,
                  background: featureIdx === i ? "var(--color-cyan)" : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>
        </motion.div>

      </div>
    </PageTransition>
  );
}

