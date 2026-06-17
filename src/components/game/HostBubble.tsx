import { AnimatePresence, motion } from "motion/react";
import { Bot } from "lucide-react";

/** Floating AI host orb + speech. */
export function HostBubble({ message }: { message: string | null }) {
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
            className="glass px-4 py-2 text-sm text-ink/90 max-w-md"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
