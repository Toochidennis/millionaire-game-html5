import { Scissors, Bot, Users, Snowflake, SkipForward } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import type { LifelineId } from "@/types";
import { cn } from "@/lib/cn";

const LIST: { id: LifelineId; icon: typeof Scissors; key: string }[] = [
  { id: "fiftyFifty", icon: Scissors, key: "50:50" },
  { id: "askAi",      icon: Bot,         key: "game_askAi" },
  { id: "crowdVote",  icon: Users,       key: "game_crowd" },
  { id: "timeFreeze", icon: Snowflake,   key: "game_freeze" },
  { id: "skip",       icon: SkipForward, key: "game_skip" },
];

export function Lifelines({
  available, onUse,
}: { available: Record<LifelineId, boolean>; onUse: (id: LifelineId) => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {LIST.map(({ id, icon: Icon, key }) => {
        const on = available[id];
        const label = key.startsWith("game_") ? t(key) : key;
        return (
          <motion.button
            key={id}
            whileTap={on ? { scale: 0.9 } : undefined}
            onClick={() => on && onUse(id)}
            disabled={!on}
            aria-label={label}
            className={cn(
              "glass flex flex-col items-center gap-1 rounded-2xl px-3 py-2 min-w-16",
              on ? "hover:neon-cyan" : "opacity-30"
            )}
          >
            <Icon size={20} className="text-cyan" />
            <span className="text-[10px] uppercase tracking-wide text-muted">{label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
