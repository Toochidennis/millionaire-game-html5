import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Settings, ThemePreset } from "@/types";
import { LOCALES } from "@/lib/i18n";

export const THEMES: ThemePreset[] = [
  { id: "aurora", name: "Aurora", accentFrom: "#22d3ee", accentTo: "#a855f7" },
  { id: "sunset", name: "Sunset", accentFrom: "#fb7185", accentTo: "#f5a524" },
  { id: "matrix", name: "Matrix", accentFrom: "#34d399", accentTo: "#22d3ee" },
  { id: "royal",  name: "Royal",  accentFrom: "#818cf8", accentTo: "#e83fb6" },
];

const SUPPORTED = new Set<string>(LOCALES.map((l) => l.code));

function detectLanguage(): string {
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of preferred) {
    const code = tag.split("-")[0].toLowerCase();
    if (SUPPORTED.has(code)) return code;
  }
  return "en";
}

const defaults: Settings = {
  themeId: "aurora", reducedMotion: false, highContrast: false, textScale: 1,
  music: 0.5, sfx: 0.7, hapticsOn: true, hostVoice: "hype", language: detectLanguage(),
  pace: "chill",
};

interface SettingsStore extends Settings {
  totalLevels: number;
  setTotalLevels: (n: number) => void;
  set: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaults,
      totalLevels: 15,
      setTotalLevels: (n) => set({ totalLevels: n }),
      set: (k, v) => set({ [k]: v } as Partial<Settings>),
      reset: () => set(defaults),
    }),
    { name: "trivia-settings" }
  )
);
