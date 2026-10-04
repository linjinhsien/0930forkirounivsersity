# GitHub Copilot Instructions — Azure AZ-900 Card Clash

## Project Overview
Vue 3 + TypeScript + Vite + Tailwind CSS + Vitest + Playwright card game for AZ-900 exam prep.

## Lint on Save (mirrors `.kiro/hooks/lint-on-save.json`)
After editing any `.ts`, `.tsx`, or `.vue` file, always run:
```bash
npx eslint --fix <filePath>
```
Then run Prettier if the file is part of a larger change:
```bash
npx prettier --write <filePath>
```

## Code Quality Rules
- **Always** fix ESLint errors before suggesting a commit.
- **Never** leave TypeScript `any` types unless unavoidable.
- Vue components must use `<script setup lang="ts">`.
- All functions must have explicit return types.

## Before Every Commit
Run these checks in order:
1. `npm run lint`
2. `npm run format:check`
3. `npm run type-check`
4. `npx vitest run`

## Commit Message Format (Conventional Commits)
```
feat: add new Azure service card
fix: correct scoring for synergy bonus
test: update snapshot after UI change
chore: update dependencies
```

## Key Files
- Card data: `src/data/cards/`
- Scenarios: `src/data/scenarios/`
- Game logic: `src/stores/game.ts`
- Scoring engine: `src/engine/scoring.ts`
- PBT tests: `src/__tests__/pbt/`
