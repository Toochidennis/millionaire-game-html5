import { useRef, useEffect } from "react";
import { LADDER, fmtCompact } from "@/lib/money";
import { cn } from "@/lib/cn";

export function MoneyLadder({ rungIndex }: { rungIndex: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    const active    = activeRef.current;
    if (!container || !active) return;

    // Double-rAF: first frame lets React + browser settle layout,
    // second frame reads stable positions after paint.
    let raf2: number;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const cRect = container.getBoundingClientRect();
        const aRect = active.getBoundingClientRect();
        // Scroll so active rung's left edge aligns with the container's left edge
        const newLeft = container.scrollLeft + (aRect.left - cRect.left);
        container.scrollTo({ left: Math.max(0, newLeft), behavior: rungIndex === 0 ? "instant" : "smooth" });
      });
    });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, [rungIndex]);

  return (
    <div
      ref={scrollRef}
      className="w-full overflow-x-auto py-1.5 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="flex gap-1 px-3 min-w-max">
        {LADDER.map((r, i) => {
          const isActive = i === rungIndex;
          const passed   = i < rungIndex;

          return (
            <div
              key={r.level}
              ref={isActive ? activeRef : undefined}
              className={cn(
                "flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-colors duration-200 cursor-default",
                isActive    && "bg-gold/20 ring-1 ring-gold/60",
                r.safeHaven && !isActive && !passed && "ring-1 ring-gold/25"
              )}
            >
              <span className={cn(
                "nums text-[10px] font-bold leading-none tracking-tight",
                isActive      ? "text-gold"
                : passed      ? "text-white/25"
                : r.safeHaven ? "text-gold/50"
                : "text-white/45"
              )}>
                {fmtCompact(r.amount)}
              </span>

              <div className={cn(
                "rounded-full transition-all duration-300",
                isActive      ? "w-2 h-2 bg-gold shadow-[0_0_6px_3px_rgba(234,179,8,0.5)]"
                : passed      ? "w-1.5 h-1.5 bg-gold/40"
                : r.safeHaven ? "w-1.5 h-1.5 bg-gold/30 ring-1 ring-gold/30"
                : "w-1 h-1 bg-white/20"
              )} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
