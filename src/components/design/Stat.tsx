import { GlassCard } from "./GlassCard";

export function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <GlassCard className="p-4 text-center" glow={accent ? "cyan" : "none"}>
      <div className={`nums text-2xl font-bold ${accent ? "text-cyan text-glow" : "text-ink"}`}>{value}</div>
      <div className="text-xs text-muted mt-1 uppercase tracking-wide">{label}</div>
    </GlassCard>
  );
}
