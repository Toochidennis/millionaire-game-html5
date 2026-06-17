import { motion } from "motion/react";
import { Snowflake } from "lucide-react";

export function Timer({ seconds, total = 30, frozen }: { seconds: number; total?: number; frozen?: boolean }) {
  const pct = Math.max(0, seconds / total);
  const danger = seconds <= 7;
  return (
    <div className="relative h-2.5 w-full rounded-full bg-white/8 overflow-hidden">
      <motion.div
        className={`absolute inset-y-0 left-0 rounded-full ${frozen ? "bg-cyan" : danger ? "bg-bad" : "bg-gradient-to-r from-cyan to-violet"}`}
        animate={{ width: `${pct * 100}%` }}
        transition={{ ease: "linear", duration: 0.9 }}
      />
      {frozen && <Snowflake size={14} className="absolute right-1 top-1/2 -translate-y-1/2 text-cyan" />}
    </div>
  );
}
