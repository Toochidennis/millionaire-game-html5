import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/cn";

type Glow = "none" | "cyan" | "violet" | "gold";

interface Props extends HTMLMotionProps<"div"> {
  glow?: Glow;
  hi?: boolean;
}

const glowClass: Record<Glow, string> = {
  none: "", cyan: "neon-cyan", violet: "neon-violet", gold: "neon-gold",
};

export function GlassCard({ glow = "none", hi, className, children, ...rest }: Props) {
  return (
    <motion.div
      className={cn("glass p-5", hi && "glass-hi", glowClass[glow], className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
