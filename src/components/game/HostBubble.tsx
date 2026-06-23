import { AnimatePresence, motion } from "motion/react";
import { Bot } from "lucide-react";

interface Props {
  message: string | null;
  crowdVotes?: number[] | null;
}

export function HostBubble({ message, crowdVotes }: Props) {
  const maxPct = crowdVotes ? Math.max(...crowdVotes) : 0;

  return (
    <div className="flex items-start gap-3">
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan to-violet neon-violet"
      >
        <Bot className="text-void" size={22} />
      </motion.div>
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="glass px-3 py-2 text-xs text-ink/90 max-w-md flex-1"
          >
            <p>{message}</p>

            {crowdVotes && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mt-2 flex items-end gap-1.5 h-9"
              >
                {crowdVotes.map((pct, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
                    <span className="text-[9px] font-bold text-ink/80">{pct}%</span>
                    <motion.div
                      className="w-full rounded-sm"
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(2, (pct / maxPct) * 20)}px` }}
                      transition={{ delay: 0.3 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      style={{ background: "linear-gradient(to top, var(--color-cyan), var(--color-violet))" }}
                    />
                    <span className="text-[9px] font-semibold text-muted">{"ABCD"[i]}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
