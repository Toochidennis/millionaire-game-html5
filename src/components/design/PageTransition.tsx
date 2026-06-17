import { motion } from "motion/react";
import type { ReactNode } from "react";

const variants = {
  initial: { opacity: 0, y: 24, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -16, filter: "blur(8px)" },
};

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.main
      variants={variants}
      initial="initial" animate="animate" exit="exit"
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-dvh px-4 pb-32 pt-6 sm:px-6 max-w-2xl mx-auto w-full"
    >
      {children}
    </motion.main>
  );
}
