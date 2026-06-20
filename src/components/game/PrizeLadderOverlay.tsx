import { motion } from "motion/react";
import { Diamond, Check } from "lucide-react";
import { LADDER, fmtMoney } from "@/lib/money";
import { cn } from "@/lib/cn";

/** Refined Millionaire diamond/hex bar — pointed ends, smooth. */
const BAR = "polygon(14px 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 14px 100%, 0% 50%)";

type RowKind = "current" | "completed" | "future";

interface Skin {
  border: string;        // stroke shown via the outer layer
  fill: string;          // glass gradient of the bar face
  text: string;          // amount colour
  num: string;           // level-number colour
  glow: string;          // resting drop-shadow (depth/aura)
}

function skin(kind: RowKind, isSafe: boolean, isTop: boolean): Skin {
  // $1,000,000 — always premium gold, regardless of progress
  if (isTop && kind !== "current") {
    return {
      border: "linear-gradient(180deg,#fde68a,#f59e0b 55%,#b45309)",
      fill:   "linear-gradient(180deg,#4a370c 0%,#33260a 55%,#241a06 100%)",
      text:   "#fcd34d",
      num:    "rgba(252,211,77,0.45)",
      glow:   "drop-shadow(0 0 7px rgba(251,191,36,0.35)) drop-shadow(0 2px 3px rgba(0,0,0,0.5))",
    };
  }

  if (kind === "current") {
    return {
      border: "linear-gradient(180deg,#fffbeb,#fbbf24 50%,#d97706)",
      fill:   "linear-gradient(180deg,#fcd34d 0%,#f59e0b 55%,#d97706 100%)",
      text:   "#ffffff",
      num:    "rgba(255,255,255,0.7)",
      glow:   "drop-shadow(0 0 4px rgba(245,158,11,0.4))",
    };
  }

  if (kind === "completed") {
    if (isSafe) {
      return {
        border: "linear-gradient(180deg,#f1f5f9,#94a3b8 55%,#475569)",
        fill:   "linear-gradient(180deg,#123a3a 0%,#0e2c30 55%,#0a2124 100%)",
        text:   "#99f6e4",
        num:    "rgba(153,246,228,0.5)",
        glow:   "drop-shadow(0 0 5px rgba(203,213,225,0.3)) drop-shadow(0 2px 3px rgba(0,0,0,0.45))",
      };
    }
    return {
      border: "linear-gradient(180deg,#2dd4bf66,#0d948866)",
      fill:   "linear-gradient(180deg,#0f3038 0%,#0c2530 55%,#0a1d28 100%)",
      text:   "#5eead4",
      num:    "rgba(94,234,212,0.4)",
      glow:   "drop-shadow(0 2px 3px rgba(0,0,0,0.4))",
    };
  }

  // future
  if (isSafe) {
    return {
      border: "linear-gradient(180deg,#e2e8f0,#94a3b8 55%,#334155)",
      fill:   "linear-gradient(180deg,#152744 0%,#101d34 55%,#0c1628 100%)",
      text:   "#e2e8f0",
      num:    "rgba(226,232,240,0.45)",
      glow:   "drop-shadow(0 0 5px rgba(203,213,225,0.28)) drop-shadow(0 2px 3px rgba(0,0,0,0.45))",
    };
  }
  return {
    border: "linear-gradient(180deg,#3b82f633,#1e3a8a22)",
    fill:   "linear-gradient(180deg,#0d182e 0%,#0a1326 55%,#080f1f 100%)",
    text:   "#64748b",
    num:    "rgba(100,116,139,0.5)",
    glow:   "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
  };
}

interface Props {
  rungIndex: number;
}

export function PrizeLadderOverlay({ rungIndex }: Props) {
  // $500 at top → $1,000,000 at bottom (natural ladder order)
  const top = LADDER.length - 1;
  // vertical position of the spotlight, tracking the current rung
  const spotlightY = (rungIndex / top) * 100;

  return (
    <div
      className="absolute inset-y-0 right-0 w-full sm:w-80 flex flex-col justify-center py-5 px-4 sm:px-5 overflow-hidden"
      style={{ background: "linear-gradient(165deg,#070d1a 0%,#0a1428 45%,#0b1c38 100%)" }}
    >
      {/* faint vertical light beam for atmosphere */}
      <div
        className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-40 pointer-events-none"
        style={{ background: "linear-gradient(180deg,transparent,rgba(59,130,246,0.06) 50%,transparent)" }}
      />
      {/* spotlight tracking the current level */}
      <motion.div
        className="absolute inset-x-0 h-48 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(245,158,11,0.16) 0%, transparent 75%)" }}
        animate={{ top: `calc(${spotlightY}% - 6rem)`, opacity: [0.7, 1, 0.7] }}
        transition={{ top: { duration: 0.5, ease: "easeOut" }, opacity: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } }}
      />

      <div className="relative flex flex-col gap-[5px]">
        {LADDER.map((rung, i) => {
          const isCurrent   = i === rungIndex;
          const isCompleted = i < rungIndex;
          const isTop       = i === top;
          const isSafe      = rung.safeHaven;
          const kind: RowKind = isCurrent ? "current" : isCompleted ? "completed" : "future";
          const s = skin(kind, isSafe, isTop);

          // stagger from top ($500) downward
          const delay = 0.25 + i * 0.035;

          return (
            <motion.div
              key={rung.level}
              initial={{ opacity: 0, x: 36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={cn("relative", isTop && "scale-[1.04] origin-center")}
            >
              {/* glow / depth layer */}
              <motion.div
                animate={
                  isCurrent
                    ? { filter: [
                        "drop-shadow(0 0 3px rgba(245,158,11,0.35))",
                        "drop-shadow(0 0 16px rgba(245,158,11,0.9))",
                        "drop-shadow(0 0 3px rgba(245,158,11,0.35))",
                      ], scale: [1, 1.025, 1] }
                    : isTop
                    ? { filter: [
                        "drop-shadow(0 0 5px rgba(251,191,36,0.25))",
                        "drop-shadow(0 0 11px rgba(251,191,36,0.55))",
                        "drop-shadow(0 0 5px rgba(251,191,36,0.25))",
                      ] }
                    : undefined
                }
                transition={
                  isCurrent ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
                  : isTop    ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
                  : undefined
                }
                style={!isCurrent && !isTop ? { filter: s.glow } : undefined}
              >
                {/* outer = stroke */}
                <div style={{ clipPath: BAR, background: s.border }} className="p-[1.5px]">
                  {/* inner = glass face */}
                  <div
                    style={{ clipPath: BAR, background: s.fill }}
                    className="relative flex items-center justify-center px-9 py-[7px]"
                  >
                    {/* top glass highlight */}
                    <div
                      className="absolute inset-x-0 top-0 h-1/2 pointer-events-none opacity-60"
                      style={{ clipPath: BAR, background: "linear-gradient(180deg,rgba(255,255,255,0.14),transparent)" }}
                    />

                    {/* level number */}
                    <span
                      className="absolute left-[14px] nums text-[9px] font-semibold tabular-nums"
                      style={{ color: s.num }}
                    >
                      {rung.level}
                    </span>

                    {/* milestone / completed indicator */}
                    {isSafe && !isCurrent && (
                      <Diamond
                        size={9}
                        className="absolute right-[15px] shrink-0"
                        style={{ color: isCompleted ? "#5eead4" : "#cbd5e1" }}
                        fill="currentColor"
                      />
                    )}
                    {isCompleted && !isSafe && (
                      <Check size={10} className="absolute right-[14px] shrink-0" style={{ color: "#5eead4" }} strokeWidth={3} />
                    )}

                    {/* amount */}
                    <span
                      className={cn(
                        "relative nums tracking-wide leading-none",
                        isCurrent ? "text-[15px] font-black"
                        : isTop   ? "text-[14px] font-extrabold"
                        : "text-[12px] font-semibold",
                      )}
                      style={{ color: s.text }}
                    >
                      {fmtMoney(rung.amount)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
