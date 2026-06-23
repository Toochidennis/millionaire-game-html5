import { lazy, Suspense, useEffect, useRef } from "react";
import { MotionConfig } from "motion/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";

const Splash          = lazy(() => import("@/pages/Splash").then((m) => ({ default: m.Splash })));
const Login           = lazy(() => import("@/pages/Login").then((m) => ({ default: m.Login })));
const Dashboard       = lazy(() => import("@/pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const Profile         = lazy(() => import("@/pages/Profile").then((m) => ({ default: m.Profile })));
const Leaderboards    = lazy(() => import("@/pages/Leaderboards").then((m) => ({ default: m.Leaderboards })));
const DailyChallenge  = lazy(() => import("@/pages/DailyChallenge").then((m) => ({ default: m.DailyChallenge })));
const JourneyMap      = lazy(() => import("@/pages/JourneyMap").then((m) => ({ default: m.JourneyMap })));
const Game            = lazy(() => import("@/pages/Game").then((m) => ({ default: m.Game })));
const Results         = lazy(() => import("@/pages/Results").then((m) => ({ default: m.Results })));
const LevelComplete   = lazy(() => import("@/pages/LevelComplete").then((m) => ({ default: m.LevelComplete })));
const Achievements    = lazy(() => import("@/pages/Achievements").then((m) => ({ default: m.Achievements })));
const Settings        = lazy(() => import("@/pages/Settings").then((m) => ({ default: m.Settings })));
const SeasonPass      = lazy(() => import("@/pages/SeasonPass").then((m) => ({ default: m.SeasonPass })));
const MultiplayerLobby = lazy(() => import("@/pages/MultiplayerLobby").then((m) => ({ default: m.MultiplayerLobby })));
import { useSettingsStore, useUserStore, THEMES } from "@/store";
import { setSfxVolume } from "@/lib/audio";
import { setMusicVolume, onUserGesture } from "@/lib/music";
import i18n, { RTL } from "@/lib/i18n";
import { initCountryCache } from "@/lib/countryCache";
import { initLanguageCache } from "@/lib/languageCache";

/** Syncs Zustand settings → DOM / audio / i18n whenever any setting changes. */
function SettingsSync() {
  const {
    themeId, reducedMotion, highContrast, textScale,
    sfx: sfxVol, music: musicVol, language,
  } = useSettingsStore();

  // Theme: update CSS custom properties so every utility class reacts instantly
  useEffect(() => {
    const t = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
    document.documentElement.style.setProperty("--color-cyan", t.accentFrom);
    document.documentElement.style.setProperty("--color-violet", t.accentTo);
  }, [themeId]);

  // SFX volume
  useEffect(() => { setSfxVolume(sfxVol); }, [sfxVol]);

  // Music volume
  useEffect(() => { setMusicVolume(musicVol); }, [musicVol]);

  // Reduced motion: data attr drives CSS; MotionConfig drives Framer Motion
  useEffect(() => {
    document.documentElement.toggleAttribute("data-rm", reducedMotion);
  }, [reducedMotion]);

  // High contrast: data attr drives CSS overrides
  useEffect(() => {
    document.documentElement.toggleAttribute("data-hc", highContrast);
  }, [highContrast]);

  // Text scale: sets root font-size so all rem units scale proportionally
  useEffect(() => {
    document.documentElement.style.fontSize = `${textScale * 100}%`;
  }, [textScale]);

  // Language + RTL direction; keep the active profile's locale in sync
  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = RTL.has(language) ? "rtl" : "ltr";
    useUserStore.getState().setLocale(language);
  }, [language]);

  return null;
}

export function App() {
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const musicStarted = useRef(false);

  // Warm API caches on startup — no-op if localStorage already has fresh data
  useEffect(() => {
    initCountryCache();
    initLanguageCache();
  }, []);

  // Start ambient music on first pointer interaction (browser autoplay policy)
  useEffect(() => {
    const handle = () => {
      if (musicStarted.current) return;
      musicStarted.current = true;
      onUserGesture();
    };
    window.addEventListener("pointerdown", handle, { once: true, passive: true });
    return () => window.removeEventListener("pointerdown", handle);
  }, []);

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
      <SettingsSync />
      <BrowserRouter>
        <Suspense fallback={<div className="h-dvh w-full bg-[#04060d]" />}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Splash />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboards" element={<Leaderboards />} />
              <Route path="/daily" element={<DailyChallenge />} />
              <Route path="/journey" element={<JourneyMap />} />
              <Route path="/game" element={<Game />} />
              <Route path="/results" element={<Results />} />
              <Route path="/level-complete" element={<LevelComplete />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/season" element={<SeasonPass />} />
              <Route path="/multiplayer" element={<MultiplayerLobby />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </MotionConfig>
  );
}
