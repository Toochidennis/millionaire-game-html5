import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { useUserStore } from "@/store";
import { PageTransition } from "@/components/design/PageTransition";

export function Splash() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const profile = useUserStore((s) => s.profile);

  useEffect(() => {
    const timer = setTimeout(() => nav(profile ? "/dashboard" : "/login"), 2200);
    return () => clearTimeout(timer);
  }, [nav, profile]);

  return (
    <PageTransition>
      <div className="grid min-h-[80dvh] place-items-center text-center">
        <div>
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            className="display text-6xl sm:text-8xl font-bold leading-none"
          >
            <span className="text-glow text-cyan">TRIVIA</span><br />
            <span className="text-glow text-gold">MILLIONAIRE</span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-6 text-muted tracking-[0.3em] uppercase text-sm"
          >
            {t("splash_sub")}
          </motion.p>
          <motion.div
            className="mx-auto mt-10 h-1 w-40 rounded-full bg-gradient-to-r from-cyan via-violet to-gold"
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 2 }}
          />
        </div>
      </div>
    </PageTransition>
  );
}
