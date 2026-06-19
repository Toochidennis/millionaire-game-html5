import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Play, RotateCcw } from "lucide-react";
import type { GamePace } from "@/types";
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";
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
    <div className="flex items-center justify-between gap-4 py-3 min-h-[52px]">
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug">{label}</p>
        {hint && <p className="text-xs text-muted mt-0.5 leading-snug">{hint}</p>}
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
        "relative h-8 w-14 rounded-full p-1 transition-colors duration-200 shrink-0",
        on ? "bg-cyan" : "bg-white/15",
      )}
    >
      <span
        className={cn(
          "block h-6 w-6 rounded-full bg-void shadow-md transition-transform duration-200",
          on ? "ltr:translate-x-6 rtl:-translate-x-6" : "translate-x-0",
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
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-snug">{label}</p>
          {hint && <p className="text-xs text-muted mt-0.5 leading-snug">{hint}</p>}
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

/* ── LangPicker ──────────────────────────────────────────────────────────── */

function LangPicker({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((l) => l.code === value) ?? LOCALES[2];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm active:bg-white/10 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3 min-w-0">
          <ReactCountryFlag
            countryCode={current.flag}
            svg
            style={{ width: "1.5em", height: "1.5em", borderRadius: "4px", flexShrink: 0 }}
          />
          <span className="truncate">{current.label}</span>
        </span>
        <ChevronDown
          size={15}
          className={cn("text-muted shrink-0 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {/* Dropdown — rendered above the trigger so it doesn't underlay the Reset button */}
      {open && (
        <div
          role="listbox"
          className="absolute bottom-full mb-1 inset-x-0 z-50 rounded-xl border border-white/10 shadow-2xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg,#1a2240,#111830)",
            backdropFilter: "blur(20px)",
            maxHeight: "min(15rem, 50vh)",
            overflowY: "auto",
          }}
        >
          {LOCALES.map((l) => {
            const selected = l.code === value;
            return (
              <button
                key={l.code}
                role="option"
                aria-selected={selected}
                onClick={() => { onChange(l.code); setOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm text-start transition-colors",
                  selected
                    ? "bg-white/12 text-ink"
                    : "text-muted hover:bg-white/8 hover:text-ink active:bg-white/10",
                )}
              >
                <ReactCountryFlag
                  countryCode={l.flag}
                  svg
                  style={{ width: "1.5em", height: "1.5em", borderRadius: "4px", flexShrink: 0 }}
                />
                <span className="flex-1">{l.label}</span>
                {selected && <Check size={12} className="text-cyan shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

const PACES: { id: GamePace; labelKey: string; hintKey: string }[] = [
  { id: "classic", labelKey: "st_classic", hintKey: "st_classic_hint" },
  { id: "chill",   labelKey: "st_chill",   hintKey: "st_chill_hint"   },
];

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
  const pct = (v: number) => (v === 0 ? t("st_off") : `${Math.round(v * 100)}%`);

  return (
    <PageTransition>
      <div>
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
            <div className="flex rounded-xl overflow-hidden border border-white/10">
              {(["hype", "calm", "witty"] as const).map((v, i) => (
                <button
                  key={v}
                  onClick={() => s.set("hostVoice", v)}
                  aria-pressed={s.hostVoice === v}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold transition-colors",
                    i > 0 && "border-l border-white/10",
                    s.hostVoice === v ? "bg-cyan/20 text-cyan" : "text-muted hover:text-ink",
                  )}
                >
                  {t(`st_${v}`)}
                </button>
              ))}
            </div>
          </Row>
        </GlassCard>

        {/* ── Gameplay ───────────────────────────────────────────────────── */}
        <GlassCard className="mb-4">
          <Row label={t("st_gamemode")} hint={t(PACES.find((d) => d.id === s.pace)?.hintKey ?? "")}>
            <div className="flex rounded-xl overflow-hidden border border-white/10">
              {PACES.map((d, i) => (
                <button
                  key={d.id}
                  onClick={() => s.set("pace", d.id)}
                  aria-pressed={s.pace === d.id}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold transition-colors",
                    i > 0 && "border-l border-white/10",
                    s.pace === d.id ? "bg-cyan/20 text-cyan" : "text-muted hover:text-ink",
                  )}
                >
                  {t(d.labelKey)}
                </button>
              ))}
            </div>
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
          <LangPicker value={s.language} onChange={(code) => s.set("language", code)} />
        </GlassCard>

        {/* ── Reset ──────────────────────────────────────────────────────── */}
        <button
          onClick={() => s.reset()}
          className="glass w-full rounded-2xl px-4 py-4 text-sm text-muted hover:text-ink flex items-center justify-center gap-2 hover:neon-cyan transition active:scale-95"
        >
          <RotateCcw size={14} />
          {t("st_reset")}
        </button>
      </div>
    </PageTransition>
  );
}
