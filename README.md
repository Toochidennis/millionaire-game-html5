# Trivia Millionaire — Global Game Show

Premium dark-futuristic HTML5 trivia game. **React 19 · TypeScript · Vite 7 · Tailwind v4 · Motion · Zustand 5 · i18next.**
Type-checks clean and builds to a production bundle out of the box.

```bash
npm install
npm run dev      # local
npm run build    # production
```

## Stack choices (2026)
- **Tailwind v4** — CSS-first config via `@theme` in `src/index.css` (no `tailwind.config.js`). All design tokens live there.
- **Motion** (`motion/react`) — the current package name for Framer Motion. Same API, smaller, React-19 ready.
- **Zustand v5** with `persist` for user/settings; the match store is an explicit finite-state machine.
- **localforage** for offline question caching (IndexedDB), so the first session works with no network.

## Folder structure
```
src/
  types/        Single source of truth for the domain model
  lib/          Pure logic: money ladder, AI host, i18n (19 locales),
                question bank + offline cache, ad abstraction, Web-Audio sfx, cn()
  store/        Zustand: useGameStore (match FSM), useUserStore (profile+stats,
                persisted), useSettingsStore (theme/sound/a11y, persisted),
                useLeaderboardStore (scoped boards)
  components/
    design/     GlassCard, NeonButton, AnimatedGradient (aurora), ParticleField,
                PageTransition, Stat
    game/       MoneyLadder (signature), Timer, AnswerOption, Lifelines,
                HostBubble, QuestionStats
    layout/     AppShell (background + route transitions), NavBar (floating)
  pages/        13 screens (see below)
  App.tsx       Router  ·  main.tsx  Entry  ·  index.css  Design system
```

## State architecture
The match is a finite-state machine — every UI affordance is derived from `phase`:

```
idle → asking → locked → revealing → stats → asking … → won
                                   ↘ lost / walked → Results
```

`useGameStore` owns: `phase`, `rungIndex`, `questions`, `selected/locked`,
`lifelines`, `eliminated` (50:50), `timeLeft/timeFrozen`, `streak`, `hostMessage`.
Selectors `current()` and `winnings()` compute view state; `safeHavenFloor()`
guarantees the floor prize on a wrong answer. Difficulty scales across the
15-rung ladder via `buildMatch()` (easy → expert).

## Pages & UX flow
`Splash → Login/Guest → Dashboard` is the entry funnel. From the Dashboard:
Game, Daily, Journey, Season, Multiplayer, Profile → Achievements, Settings,
Leaderboards. Game terminal states auto-route to the animated Results reveal,
which records stats and offers replay (and a rewarded-ad revive hook).

## Where production integrations plug in (clearly stubbed)
- **AI host / Ask-AI lifeline** → `lib/host.ts`: swap the line bank for a stream
  from the Anthropic `/v1/messages` endpoint using the question as context.
- **Ads** → `lib/ads.ts`: implement `AdProvider` for AdMob/Unity; rewarded +
  interstitial are provider-agnostic and no-op offline.
- **Questions** → `lib/questions.ts`: `loadQuestionBank()` reads cache → seed;
  point it at your CDN and it stays offline-first.
- **Leaderboards / Multiplayer** → `useLeaderboardStore` (paginated fetch) and
  `MultiplayerLobby` (open a WebSocket/WebRTC pairing channel).
- **i18n** → `lib/i18n.ts` ships 19 locales + RTL set; add `i18next-http-backend`
  to lazy-load namespaces per language.

## Performance next steps
- Route-level `React.lazy` + `Suspense` to code-split (kills the bundle warning).
- `manualChunks` to isolate `motion`/`localforage`.
- Register a service worker (e.g. `vite-plugin-pwa`) for full offline install.
```
