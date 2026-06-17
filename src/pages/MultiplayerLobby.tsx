import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Swords, Loader2, Globe } from "lucide-react";
import { PageTransition } from "@/components/design/PageTransition";
import { GlassCard } from "@/components/design/GlassCard";
import { NeonButton } from "@/components/design/NeonButton";

export function MultiplayerLobby() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const [searching, setSearching] = useState(false);

  const match = () => {
    setSearching(true);
    // In prod: open a WebSocket / WebRTC channel and pair players.
    setTimeout(() => nav("/game"), 2200);
  };

  return (
    <PageTransition>
      <h1 className="display text-3xl font-bold mb-5">{t("mp_title")}</h1>
      <GlassCard glow="violet" hi className="text-center space-y-4">
        <Swords size={40} className="text-violet mx-auto" />
        <p className="display text-xl font-semibold">{t("mp_1v1")}</p>
        <p className="text-muted text-sm">{t("mp_desc")}</p>

        {searching ? (
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.4 }}
            className="flex items-center justify-center gap-2 text-cyan">
            <Loader2 className="animate-spin" /> {t("mp_searching")}
          </motion.div>
        ) : (
          <NeonButton variant="primary" onClick={match}>
            <span className="flex items-center gap-2"><Globe size={18} /> {t("mp_match")}</span>
          </NeonButton>
        )}
      </GlassCard>
      <p className="mt-4 text-center text-xs text-muted">{t("mp_rooms")}</p>
    </PageTransition>
  );
}
