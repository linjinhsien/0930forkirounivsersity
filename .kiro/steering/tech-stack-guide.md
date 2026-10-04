# Steering Guide: Current Project Architecture and Code Style

## Project Stack

- Vue 3, TypeScript, and Vite; use Composition API and `<script setup lang="ts">`.
- Pinia for game, player, codex, and session state.
- Vue Router for client-side navigation.
- Vue I18n with English, Simplified Chinese, Japanese, Spanish, German, and French locale files in `src/i18n/locales/`.
- Tailwind CSS for responsive styling.
- Vitest and Vue Test Utils for unit/integration tests; Playwright for browser E2E tests.
- Do not introduce React, another state library, a component framework, or a new dependency unless the task specifically requires it and the existing stack cannot meet the need.

## Repository Layout

```text
src/
  components/       Shared layout, UI, card, board, codex, and game components
  composables/      Reusable Vue behavior, including session resume
  data/cards/       AZ-900 card JSON, grouped by the three game domains
  data/codex/       Per-card learning entries
  data/scenarios/   Scenario JSON grouped by category
  engine/           Validation, scoring, and multiplayer evaluation
  i18n/locales/     Six supported UI locales
  stores/           Pinia game, player, codex, and session stores
  types/            Game and engine TypeScript contracts
  utils/            Data loading, persistence, errors, and performance utilities
  views/            Home, quick match, multiplayer, codex, settings, topology map
tests/
  unit/             Unit and component tests
  integration/      Game-flow and persistence tests
  e2e/              Playwright user flows
```

Use the existing domain types and helpers. Keep card/scenario content in the established JSON data files rather than duplicating it in components.

## TypeScript and Vue

- Preserve strict type checking. Avoid `any`; use explicit domain types and narrow `unknown` at boundaries.
- Type component props and emitted events. Prefer existing types in `src/types/game.ts` and `src/types/engine.ts`.
- Keep components focused and use the established separation between views, reusable components, Pinia stores, engines, and data loaders.
- Lazy-load route views and large data where the current project already does so.
- Do not add React examples or APIs to project guidance.

## Routing and GitHub Pages

- The production host is GitHub Pages through `.github/workflows/deploy-pages.yml`, not Azure Static Web Apps.
- `vite.config.ts` sets the production base to `/0930forkirounivsersity/` in GitHub Actions.
- `src/router.ts` uses `createWebHashHistory(import.meta.env.BASE_URL)`. Deployed routes therefore look like `https://linjinhsien.github.io/0930forkirounivsersity/#/quick-match` and `/#/topology`.
- Preserve hash-based routing. Do not switch to history mode or add a `404.html` workaround unless deployment behavior and all direct-route/refresh cases are deliberately re-evaluated.
- Use Vue Router links for in-app navigation; do not hard-code root-relative anchors for application routes.

## Styling, Accessibility, and Localization

- Use existing Tailwind patterns and mobile-first responsive layouts.
- Preserve semantic HTML, keyboard operation, visible focus, accessible names, and ARIA patterns already used by the UI.
- Add UI copy to all six locale JSON files when it is intended to be translated; English is the fallback locale.
- The topology map is an interactive learning view at `/#/topology`; maintain keyboard-operable node selection and its source links when changing it.

## State and Persistence

- Use Pinia stores for shared game/player/codex/session state and Vue reactivity for view-local state.
- Session persistence is browser-local, with expiry/resume behavior in the session store and related utilities. Do not imply server-side accounts, cloud sync, or multiplayer networking; multiplayer is a local two-player clash.
- Surface storage and loading failures using the project's explicit error/status patterns.

## Quality Commands

Run the narrowest relevant checks, and run the full build/type check before shipping code changes:

```sh
npm run lint
npm run format:check
npm run type-check
npm run test:unit
npx playwright test <relevant-spec> --workers=1
npm run build
```

`npm run lint` invokes ESLint with `--fix`; be aware it may modify files. `npm run test:coverage` is available for coverage reporting. The Pages deployment workflow runs lint, formatting, type checking, unit tests, and the production build before deploying.

## Git and Changes

- Make focused changes and preserve unrelated worktree changes.
- Use the repository's existing formatting, tests, and Conventional Commit style.
- Do not commit credentials or secrets. Treat all `VITE_` environment variables as public because they are bundled into browser assets.
