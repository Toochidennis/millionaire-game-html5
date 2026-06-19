import { motion } from "motion/react";
import { Shield } from "lucide-react";
import { LADDER } from "@/lib/money";
import { fmtMoney } from "@/lib/money";
import { cn } from "@/lib/cn";

const DIAMOND = "polygon(16px 0%, calc(100% - 16px) 0%, 100% 50%, calc(100% - 16px) 100%, 16px 100%, 0% 50%)";

const GLOW_PULSE = {
  filter: [
    "drop-shadow(0 0 4px rgba(234,179,8,0.3))",
    "drop-shadow(0 0 18px rgba(234,179,8,1))",
    "drop-shadow(0 0 4px rgba(234,179,8,0.3))",
  ],
  scale: [1, 1.04, 1],
};

interface Props {
  rungIndex: number;
}

export function PrizeLadderOverlay({ rungIndex }: Props) {
  const reversed = [...LADDER].reverse(); // $1M at top, $500 at bottom

  return (
    <div
      className="absolute inset-y-0 right-0 w-full sm:w-80 flex flex-col justify-center py-4 px-3 sm:px-4"
      style={{ background: "linear-gradient(160deg,#080f1e 0%,#0c1830 60%,#0d1f3c 100%)" }}
    >
      {/* Radial glow behind ladder */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,0.12) 0%, transparent 80%)" }}
      />

      <div className="relative flex flex-col gap-1.5">
        {reversed.map((rung, visualIdx) => {
          const ladderIdx  = rung.level - 1;
          const isCurrent  = ladderIdx === rungIndex;
          const isCompleted = ladderIdx < rungIndex;
          const isSafeHaven = rung.safeHaven;
          const isTop      = rung.level === LADDER.length;
          // stagger: bottom row (visualIdx = reversed.length-1) appears first
          const staggerDelay = 0.28 + (reversed.length - 1 - visualIdx) * 0.03;

          return (
            <motion.div
              key={rung.level}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: staggerDelay, duration: 0.25, ease: "easeOut" }}
            >
              <motion.div
                style={{ clipPath: DIAMOND }}
                animate={isCurrent ? GLOW_PULSE : undefined}
                transition={isCurrent ? { duration: 1.3, repeat: Infinity, ease: "easeInOut" } : undefined}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 px-8 select-none",
                  // current
                  isCurrent && "bg-amber-500 text-white",
                  // completed safe haven
                  isCompleted && isSafeHaven && "bg-amber-900/60 text-amber-300",
                  // completed normal
                  isCompleted && !isSafeHaven && "bg-amber-950/70 text-amber-700",
                  // $1M not yet reached
                  !isCurrent && !isCompleted && isTop && "bg-yellow-950/60 text-yellow-500",
                  // future safe haven
                  !isCurrent && !isCompleted && !isTop && isSafeHaven && "bg-slate-900/80 text-slate-200",
                  // future normal
                  !isCurrent && !isCompleted && !isTop && !isSafeHaven && "bg-blue-950/80 text-slate-500",
                )}
              >
                {isSafeHaven && !isCurrent && (
                  <Shield
                    size={10}
                    className={cn("shrink-0", isCompleted ? "text-amber-400" : "text-slate-400")}
                  />
                )}
                <span
                  className={cn(
                    "nums leading-none tracking-wide",
                    isCurrent  && "text-sm font-black",
                    isCompleted && "text-xs font-medium",
                    !isCurrent && !isCompleted && isTop  && "text-sm font-bold",
                    !isCurrent && !isCompleted && !isTop && "text-xs font-medium",
                  )}
                >
                  {fmtMoney(rung.amount)}
                </span>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
