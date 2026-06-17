import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Globe } from "lucide-react";
import { useUserStore } from "@/store";
import { PageTransition } from "@/components/design/PageTransition";
import { GlassCard } from "@/components/design/GlassCard";
import { NeonButton } from "@/components/design/NeonButton";

const COUNTRIES = ["NG", "US", "GB", "IN", "BR", "JP", "KR", "DE", "FR", "ZA", "AE", "MX"];

export function Login() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const { loginGuest, loginNamed } = useUserStore();
  const [name, setName] = useState("");
  const [cc, setCc] = useState("NG");

  const go = (named: boolean) => {
    named && name.trim() ? loginNamed(name.trim(), cc) : loginGuest();
    nav("/dashboard");
  };

  return (
    <PageTransition>
      <div className="grid min-h-[80dvh] place-items-center">
        <GlassCard glow="violet" className="w-full max-w-md space-y-5">
          <motion.h1 className="display text-3xl font-bold text-center"
            initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            {t("login_title")}
          </motion.h1>

          <div className="space-y-3">
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder={t("login_name")}
              className="w-full rounded-2xl bg-white/8 px-4 py-3 outline-none placeholder:text-muted"
            />
            <div className="flex items-center gap-2 rounded-2xl bg-white/8 px-4 py-3">
              <Globe size={18} className="text-cyan" />
              <select value={cc} onChange={(e) => setCc(e.target.value)}
                className="w-full bg-transparent outline-none">
                {COUNTRIES.map((c) => <option key={c} value={c} className="bg-deep">{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <NeonButton full onClick={() => go(true)}>{t("login_enter")}</NeonButton>
            <NeonButton full variant="ghost" onClick={() => go(false)}>{t("login_guest")}</NeonButton>
          </div>
          <p className="text-center text-xs text-muted">{t("login_social")}</p>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
