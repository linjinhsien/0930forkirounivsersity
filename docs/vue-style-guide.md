# Vue Component Style Guide

## Scope
Conventions for Vue 3 components in this repository.

## Component Structure
Use Vue 3 Composition API with `<script setup lang="ts">`. Keep domain logic in stores or engine modules rather than presentation components.

## Props and Emits
Use explicit TypeScript interfaces with `defineProps` and `defineEmits`. Prefer domain types from `src/types/` over anonymous object shapes.

## State Management
Use Pinia stores for shared state: `game` for active game state, `player` for profile/progression/preferences, `codex` for learning data, and `session` for persistence.

## Accessibility
Use semantic HTML first. Every interactive element needs an accessible name. Preserve keyboard focus, use live regions for important asynchronous status, and respect reduced-motion preferences.

## Styling
Use Tailwind utility classes for layout and visual states. Reuse existing design tokens and accessibility variants instead of one-off values.

## Data Loading
Use `src/utils/dataLoader.ts` for card, scenario, and Codex data. Keep large datasets lazy-loaded where practical.

## Testing
Engine logic uses unit/property tests; stores use unit/integration tests; component interactions use component tests; user journeys use Playwright E2E tests.

## Quality Gate
Run `npm run lint`, `npm run format:check`, `npm run type-check`, `npm run test:unit`, and `npm run build` before merging.

## Naming
Components: `PascalCase.vue`; composables: `useSomething.ts`; stores: descriptive lowercase names; types: domain-oriented names; tests match source names with `.test.ts`.
