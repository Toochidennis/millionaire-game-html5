import { GlassCard } from "./GlassCard";

export function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <GlassCard className="!p-3 text-center overflow-hidden" glow={accent ? "cyan" : "none"}>
      <div
        className={`nums text-base sm:text-xl font-bold leading-tight truncate ${
          accent ? "text-cyan text-glow" : "text-ink"
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] text-muted mt-1 uppercase tracking-wide leading-snug line-clamp-2">
        {label}
      </div>
    </GlassCard>
  );
}
