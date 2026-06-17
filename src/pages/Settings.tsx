import { Check, Play, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSettingsStore, THEMES } from "@/store";
import { LOCALES } from "@/lib/i18n";
import { sfx } from "@/lib/audio";
import { PageTransition } from "@/components/design/PageTransition";
import { GlassCard } from "@/components/design/GlassCard";
import { cn } from "@/lib/cn";

/* ── tiny primitives ─────────────────────────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="display font-semibold mb-3 text-base">{children}</p>;
}

function Divider() {
  return <hr className="border-white/5 my-0" />;
}

function Row({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm leading-none">{label}</p>
        {hint && <p className="text-xs text-muted mt-1 leading-snug">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-7 w-12 rounded-full p-1 transition-colors duration-200",
        on ? "bg-cyan" : "bg-white/15",
      )}
    >
      <span
        className={cn(
          "block h-5 w-5 rounded-full bg-void shadow transition-transform duration-200",
          on && "translate-x-5",
        )}
      />
    </button>
  );
}

function SliderRow({
  label, hint, value, min, max, step, displayValue, onChange, onTest, testLabel,
}: {
  label: string; hint?: string;
  value: number; min: number; max: number; step: number;
  displayValue: string;
  onChange: (v: number) => void;
  onTest?: () => void;
  testLabel?: string;
}) {
  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm leading-none">{label}</p>
          {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="nums text-xs text-cyan w-10 text-right">{displayValue}</span>
          {onTest && (
            <button
              onClick={onTest}
              className="glass rounded-lg px-2 py-1 text-xs text-cyan hover:neon-cyan transition flex items-center gap-1"
              aria-label="Test sound"
            >
              <Play size={9} />
              {testLabel ?? "Test"}
            </button>
          )}
        </div>
      </div>
      <input
        type="range"
        className="slider w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
    </div>
  );
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

const pct = (v: number) => (v === 0 ? "Off" : `${Math.round(v * 100)}%`);

const TEXT_SIZE_KEYS: Record<number, string> = {
  9: "st_compact", 10: "st_normal", 11: "st_large",
  12: "st_larger", 13: "st_largest", 14: "st_max",
};

/* ── main component ──────────────────────────────────────────────────────── */

export function Settings() {
  const { t } = useTranslation();
  const s = useSettingsStore();
  const scaleKey = Math.round(s.textScale * 10);
  const textSizeLabel = TEXT_SIZE_KEYS[scaleKey] ? t(TEXT_SIZE_KEYS[scaleKey]) : `${Math.round(s.textScale * 100)}%`;

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-28 max-w-lg mx-auto">
        <h1 className="display text-3xl font-bold mb-6">{t("st_title")}</h1>

        {/* ── Theme ──────────────────────────────────────────────────────── */}
        <GlassCard className="mb-4">
          <SectionTitle>{t("st_theme")}</SectionTitle>
          <div className="grid grid-cols-4 gap-3">
            {THEMES.map((theme) => {
              const active = s.themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => s.set("themeId", theme.id)}
                  className="flex flex-col items-center gap-1.5 group"
                  aria-label={`${theme.name} theme`}
                  aria-pressed={active}
                >
                  <div
                    className={cn(
                      "relative h-12 w-full rounded-2xl overflow-hidden transition-all duration-200",
                      active
                        ? "ring-2 ring-white/80 scale-105"
                        : "opacity-60 hover:opacity-90 hover:scale-102",
                    )}
                    style={{ background: `linear-gradient(135deg, ${theme.accentFrom}, ${theme.accentTo})` }}
                  >
                    {active && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <Check size={15} className="text-white drop-shadow" />
                      </div>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] transition-colors leading-none",
                      active ? "text-ink font-medium" : "text-muted",
                    )}
                  >
                    {theme.name}
                  </span>
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* ── Sound ──────────────────────────────────────────────────────── */}
        <GlassCard className="mb-4">
          <SectionTitle>{t("st_sound")}</SectionTitle>
          <SliderRow
            label={t("st_music")}
            hint={t("st_musicHint")}
            value={s.music}
            min={0}
            max={1}
            step={0.05}
            displayValue={pct(s.music)}
            onChange={(v) => s.set("music", v)}
          />
          <Divider />
          <SliderRow
            label={t("st_fx")}
            hint={t("st_fxHint")}
            value={s.sfx}
            min={0}
            max={1}
            step={0.05}
            displayValue={pct(s.sfx)}
            onChange={(v) => s.set("sfx", v)}
            onTest={() => sfx.correct()}
            testLabel={t("st_test")}
          />
          <Divider />
          <Row label={t("st_host")} hint={t("st_hostHint")}>
            <select
              value={s.hostVoice}
              onChange={(e) => s.set("hostVoice", e.target.value as "hype" | "calm" | "witty")}
              className="glass rounded-xl px-3 py-1.5 text-sm cursor-pointer"
            >
              <option className="bg-deep" value="hype">{t("st_hype")}</option>
              <option className="bg-deep" value="calm">{t("st_calm")}</option>
              <option className="bg-deep" value="witty">{t("st_witty")}</option>
            </select>
          </Row>
        </GlassCard>

        {/* ── Accessibility ──────────────────────────────────────────────── */}
        <GlassCard className="mb-4">
          <SectionTitle>{t("st_access")}</SectionTitle>
          <Row label={t("st_motion")} hint={t("st_motionHint")}>
            <Toggle on={s.reducedMotion} onChange={(v) => s.set("reducedMotion", v)} />
          </Row>
          <Divider />
          <Row label={t("st_contrast")} hint={t("st_contrastHint")}>
            <Toggle on={s.highContrast} onChange={(v) => s.set("highContrast", v)} />
          </Row>
          <Divider />
          <Row label={t("st_haptics")} hint={t("st_hapticsHint")}>
            <Toggle on={s.hapticsOn} onChange={(v) => s.set("hapticsOn", v)} />
          </Row>
          <Divider />
          <SliderRow
            label={t("st_textSize")}
            value={s.textScale}
            min={0.9}
            max={1.4}
            step={0.1}
            displayValue={textSizeLabel}
            onChange={(v) => s.set("textScale", v)}
          />
        </GlassCard>

        {/* ── Language ───────────────────────────────────────────────────── */}
        <GlassCard className="mb-4">
          <SectionTitle>{t("st_language")}</SectionTitle>
          <select
            value={s.language}
            onChange={(e) => s.set("language", e.target.value)}
            className="glass rounded-xl px-3 py-2.5 text-sm w-full cursor-pointer"
          >
            {LOCALES.map((l) => (
              <option key={l.code} className="bg-deep" value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </GlassCard>

        {/* ── Reset ──────────────────────────────────────────────────────── */}
        <button
          onClick={() => s.reset()}
          className="glass w-full rounded-2xl px-4 py-3 text-sm text-muted hover:text-ink flex items-center justify-center gap-2 hover:neon-cyan transition"
        >
          <RotateCcw size={13} />
          {t("st_reset")}
        </button>
      </div>
    </PageTransition>
  );
}
