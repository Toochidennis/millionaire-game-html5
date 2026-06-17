import { motion } from "motion/react";
import { LADDER } from "@/lib/money";
import { fmtMoney } from "@/lib/money";
import { cn } from "@/lib/cn";

/** Signature element: the holographic money spine. Current rung pulses gold. */
export function MoneyLadder({ rungIndex, compact }: { rungIndex: number; compact?: boolean }) {
  const rungs = [...LADDER].reverse();
  return (
    <div className={cn("glass p-3 flex flex-col gap-1", compact ? "w-full" : "w-56")}>
      {rungs.map((r) => {
        const idx = r.level - 1;
        const active = idx === rungIndex;
        const passed = idx < rungIndex;
        return (
          <motion.div
            key={r.level}
            layout
            className={cn(
              "flex items-center justify-between rounded-xl px-3 py-1.5 text-sm",
              active && "rung-active bg-gold/15",
              passed && "opacity-50",
              r.safeHaven && !active && "ring-1 ring-gold/40"
            )}
          >
            <span className={cn("nums w-6 text-xs", active ? "text-gold" : "text-muted")}>{r.level}</span>
            <span className={cn("nums font-semibold", active ? "text-gold text-glow" : r.safeHaven ? "text-gold/80" : "text-ink")}>
              {fmtMoney(r.amount)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
