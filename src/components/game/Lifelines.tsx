import { Scissors, Bot, Users, Snowflake, SkipForward, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import type { GamePace, LifelineId } from "@/types";
import { cn } from "@/lib/cn";

const LIST: { id: LifelineId; icon: typeof Scissors; key: string; classicOnly?: boolean }[] = [
  { id: "fiftyFifty",    icon: Scissors,    key: "50:50" },
  { id: "askAi",         icon: Bot,         key: "game_askAi" },
  { id: "crowdVote",     icon: Users,       key: "game_crowd" },
  { id: "timeFreeze",    icon: Snowflake,   key: "game_freeze",  classicOnly: true },
  { id: "skip",          icon: SkipForward, key: "game_skip" },
  { id: "resetQuestion", icon: RotateCcw,   key: "game_reset" },
];

export function Lifelines({
  available, onUse, pace,
}: {
  available: Record<LifelineId, boolean>;
  onUse: (id: LifelineId) => void;
  pace: GamePace;
}) {
  const { t } = useTranslation();
  const visible = LIST.filter((l) => !(l.classicOnly && pace === "chill"));

  return (
    <div className="flex gap-1.5">
      {visible.map(({ id, icon: Icon, key }) => {
        const on = available[id];
        const label = key.startsWith("game_") ? t(key) : key;
        return (
          <motion.button
            key={id}
            whileTap={on ? { scale: 0.88 } : undefined}
            onClick={() => on && onUse(id)}
            disabled={!on}
            aria-label={label}
            className={cn(
              "glass flex-1 flex flex-col items-center gap-0.5 rounded-2xl py-2",
              on ? "hover:neon-cyan" : "opacity-30"
            )}
          >
            <Icon size={16} className="text-cyan" />
            <span className="text-[8px] uppercase tracking-wide text-muted leading-none">{label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
