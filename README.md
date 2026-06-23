# Trivia Millionaire — Global Game Show

Premium dark-futuristic HTML5 trivia game. **React 19 · TypeScript · Vite 7 · Tailwind v4 · Motion · Zustand 5 · Dexie · i18next.**
Type-checks clean and builds to a production bundle out of the box.

```bash
npm install
npm run dev      # local dev
npm run build    # production bundle
```

## Stack choices (2026)
- **Tailwind v4** — CSS-first config via `@theme` in `src/index.css` (no `tailwind.config.js`). All design tokens live there.
- **Motion** (`motion/react`) — current package name for Framer Motion. Same API, smaller, React 19 ready.
- **Zustand v5** with `persist` for user/settings; the match store is an explicit finite-state machine.
- **Dexie.js** (IndexedDB) for offline question caching and seen-question tracking, so the game works without a network after the first load.

## Folder structure
```
src/
  api/
    services/     game.service.ts — questions, languages, countries
    models/       TypeScript shapes for all API responses
    client.ts     Base fetch wrapper
  types/          Single source of truth for the domain model
  lib/            Pure logic: money ladder, AI host, i18n (21 locales),
                  question bank + offline cache, country helpers, sfx, cn()
  store/          Zustand: useGameStore (match FSM), useUserStore (profile +
                  stats + wallet, persisted), useSettingsStore (theme/sound/
                  a11y/totalLevels, persisted), useLeaderboardStore
  components/
    design/       GlassCard, NeonButton, AnimatedGradient (aurora),
                  ParticleField, PageTransition, Stat, CountryPicker, Confetti
    game/         MoneyLadder, Timer, AnswerOption, Lifelines,
                  HostBubble, QuestionStats
    layout/       AppShell, NavBar (floating)
  pages/          14 screens (see below)
  App.tsx         Router  ·  main.tsx  Entry  ·  index.css  Design system
```

## State architecture
The match is a finite-state machine — every UI affordance is derived from `phase`:

```
idle → asking → locked → revealing → stats → asking … → won (LevelComplete)
                                   ↘ lost / walked → Results
```

`useGameStore` owns: `phase`, `rungIndex`, `questions`, `selected/locked`,
`lifelines`, `eliminated` (50:50), `timeLeft/timeFrozen`, `streak`, `hostMessage`, `bank`.
Selectors `current()` and `winnings()` compute view state; `safeHavenFloor()`
guarantees the floor prize on a wrong answer.

## Level & wallet system
- **Levels** — `totalLevels` in `useSettingsStore` is read from `data.levels.length`
  in the API response on every game load. If the API gains new levels the player's
  progression cap updates automatically. The 15-question match and prize ladder are separate.
- **Wallet** — `setWallet(amount)` replaces on a level win; `addToWallet(amount)`
  accumulates on loss or walk-away. Both are persisted in `useUserStore`.
- **Prize multiplier** — `applyLevel(amount, level)` = `amount × Math.max(1, level)`
  so higher-level players earn more per win.

## Pages & UX flow
`Splash → Login/Guest → Dashboard` is the entry funnel. Dashboard is viewport-locked
(no scroll) with the tile grid filling available space. From the Dashboard:
Game → LevelComplete (win) / Results (loss/walk), Daily, Journey, Season,
Multiplayer, Profile → Achievements, Settings, Leaderboards.

## Mobile-first decisions
- Countdown bar uses `clipPath: inset()` animation — avoids the iOS Safari
  `scaleX` + `overflow-hidden` rendering bug.
- Money ladder auto-scrolls the active rung to the left edge (conveyor belt)
  via double-rAF + `getBoundingClientRect()` — no `scrollIntoView` or `offsetLeft` guesses.
- No page transition animations — instant route switches eliminate blur/delay on mobile.
- No stagger-in animations on list pages — prevents card flash on low-end devices.

## Where production integrations plug in (clearly stubbed)
- **Questions** → `api/services/game.service.ts`: reads from the backend
  configured via `VITE_API_BASE_URL`. 24-hour Dexie cache; falls back to stale
  cache, then seed questions if offline.
- **AI host / Ask-AI lifeline** → `lib/host.ts`: swap the line bank for a stream
  from the Anthropic `/v1/messages` endpoint using the question as context.
- **Ads** → `lib/ads.ts`: implement `AdProvider` for AdMob/Unity; rewarded +
  interstitial are provider-agnostic and no-op offline.
- **Leaderboards / Multiplayer** → `useLeaderboardStore` (paginated fetch) and
  `MultiplayerLobby` (open a WebSocket/WebRTC pairing channel).
- **Auth** → Google sign-in hook in `Login.tsx` is wired but not yet connected
  to a backend session.
- **i18n** → `lib/i18n.ts` ships 21 locales + RTL set; add `i18next-http-backend`
  to lazy-load namespaces per language.

## Performance next steps
- Route-level `React.lazy` + `Suspense` to code-split (kills the bundle warning).
- `manualChunks` to isolate `motion` / `dexie`.
- Register a service worker (e.g. `vite-plugin-pwa`) for full offline install.
