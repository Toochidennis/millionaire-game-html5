import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger" | "gold";
  disabled?: boolean;
  full?: boolean;
  className?: string;
  type?: "button" | "submit";
}

const styles = {
  primary: "bg-gradient-to-r from-cyan to-violet text-void neon-cyan",
  gold: "bg-gradient-to-r from-gold to-gold-deep text-void neon-gold",
  danger: "bg-gradient-to-r from-bad to-magenta text-ink",
  ghost: "glass text-ink hover:glass-hi",
};

export function NeonButton({ children, onClick, variant = "primary", disabled, full, className, type = "button" }: Props) {
  return (
    <motion.button
      type={type}
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "display font-semibold rounded-2xl px-6 py-3 text-base transition disabled:opacity-40 disabled:cursor-not-allowed",
        full && "w-full", styles[variant], className
      )}
    >
      {children}
    </motion.button>
  );
}
