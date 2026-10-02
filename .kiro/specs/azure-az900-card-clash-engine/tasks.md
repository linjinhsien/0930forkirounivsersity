# Implementation Plan: Azure AZ-900 Architecture Card Clash Engine

## Overview

This implementation plan breaks down the Azure AZ-900 Card Clash Engine into concrete, actionable development tasks organized by architectural layer. The feature is a Vue 3 + TypeScript web game that teaches Azure fundamentals through scenario-driven card placement gameplay with real-time validation, scoring, and multiplayer support.

**Implementation Approach**: Build from foundation (project setup) through core game engines, then UI layers, persistence, and finally testing and deployment. Each task builds incrementally, ensuring core game logic is solid before presentation layers are added.

---

## Tasks

### Phase 1: Foundation & Project Setup

- [x] 1. Initialize Vue 3 + Vite project with TypeScript strict mode
  - Set up Vite project with Vue 3, TypeScript 5.0+, strict mode enabled
  - Configure absolute path aliases (`@/` → `src/`)
  - Install and configure ESLint, Prettier, and pre-commit hooks
  - Create `.env` templates for development/production
  - _Requirements: 8.1, 8.3 (setup for i18n and accessibility)_

- [x] 2. Configure Tailwind CSS and design tokens
  - Install Tailwind CSS 3.x with Vue 3 plugin
  - Create custom theme configuration for AZ-900 card domains (domain colors)
  - Add custom utility classes for card styling and game board layout
  - Set up dark mode support with `dark:` variants
  - Create design token file for colors, spacing, typography
  - _Requirements: 8.2 (high-contrast mode support)_

- [x] 3. Set up Pinia state management and store directory structure
  - Install Pinia and integrate with Vue 3 app
  - Configure store auto-import (optional but recommended)
  - Create store directory structure: `src/stores/`
  - Initialize empty store files: `game.ts`, `player.ts`, `codex.ts`, `session.ts`
  - _Requirements: 1.1, 1.3 (state management for game and scores)_

- [x] 4. Configure testing framework (Vitest) and Vue Testing Library
  - Install Vitest, Vue Test Utils, @testing-library/vue
  - Set up Vitest configuration with coverage reporting
  - Create test directory structure: `tests/unit/`, `tests/integration/`, `tests/e2e/`
  - Configure snapshot testing and mocking utilities
  - _Requirements: (testing infrastructure)_

- [x] 5. Set up Playwright for E2E testing
  - Install Playwright and configure for chromium browser
  - Create base test fixtures and utilities
  - Set up test configuration with timeout and retry settings
  - _Requirements: (E2E test infrastructure)_

- [x] 6. Initialize Git repository and GitHub Actions CI/CD
  - Initialize Git repo (or configure existing one)
  - Create `.github/workflows/` directory
  - Set up CI/CD pipeline: lint → type-check → test → build
  - Create deployment workflow for Azure Static Web Apps
  - _Requirements: (deployment infrastructure)_

---

### Phase 2: Core Data Models & TypeScript Definitions

- [x] 7. Define AZ-900 card and game type system
  - Create `src/types/game.ts` with all core interfaces:
    - `AzureCard`, `ArchitectureSlot`, `Scenario`, `GameState`, `PlayerProfile`, `SavedSession`, etc.
  - Export all domain types: `AZ900Domain`, `RequirementType`, `ValidationResult`, etc.
  - Add JSDoc comments to all interfaces with clear descriptions
  - Ensure strict TypeScript compliance (no `any` types)
  - _Requirements: 1.1, 1.4, 4.1, 5.2_

- [x] 8. Create game engine interface layer
  - Create `src/types/engine.ts` with engine contract interfaces:
    - `IValidationEngine`, `IScoringEngine`, `IEvaluatorEngine`
  - Define validation violation and score breakdown interfaces
  - Add performance measurement interfaces for monitoring
  - _Requirements: 1.2, 1.3, 1.4_

- [x] 9. Generate initial card database (JSON data files)
  - Create `src/data/cards/` directory structure
  - Generate and populate card JSON files for all three AZ-900 domains:
    - `cloud-concepts.json` (15-20 cards)
    - `azure-services.json` (25-30 cards)
    - `management-governance.json` (15-20 cards)
  - Ensure each card has: `id`, `name`, `domain`, `cost`, `synergyTags`, `az900ExamTip`, `description`, `power`, `requirements`, `conflicts`
  - Validate card data against TypeScript types
  - _Requirements: 5.1, 5.2 (card library content)_

- [x] 10. Generate scenario database (JSON data files)
  - Create `src/data/scenarios/` directory structure
  - Generate and populate scenario JSON files by category:
    - `startup-scaling.json` (4-6 scenarios, beginner difficulty)
    - `enterprise-migration.json` (4-6 scenarios, intermediate difficulty)
    - `high-compliance.json` (4-6 scenarios, advanced difficulty)
    - `real-time-analytics.json` (2-3 scenarios, mixed difficulty)
  - Each scenario: `id`, `title`, `description`, `requirements`, `constraints`, `maxRounds`, `difficulty`, `category`
  - Validate scenarios match requirements structure
  - _Requirements: 3.2, 6.4 (scenario content and difficulty)_

- [x] 11. Create Codex entry database (JSON data files)
  - Create `src/data/codex/` directory with entry JSON for each card
  - Each entry: `cardId`, `examDefinition`, `useCases[]`, `bestPractices[]`, `relatedServices[]`, `resources[]`
  - Validate all cards have corresponding codex entries
  - Ensure exam definitions align with AZ-900 official content
  - _Requirements: 5.2, 5.3 (codex content)_

- [x] 12. Create data loader utility and initialization
  - Create `src/utils/dataLoader.ts` to load all JSON data files
  - Implement lazy loading for card and scenario data
  - Add data validation function to verify schema compliance
  - Export data loaders for use in store initialization
  - _Requirements: 1.1 (data initialization)_

---

### Phase 3: State Management (Pinia Stores)

- [x] 13. Implement game store (Pinia)
  - Create `src/stores/game.ts` with full game state and actions:
    - State: `gameState`, `validationResult`, `isValidating`
    - Computed: `currentScenario`, `placedCards`, `currentScore`, `isGameActive`
    - Actions: `initializeGame()`, `placeCard()`, `removeCard()`, `updateScore()`, `submitSolution()`
  - Implement state persistence trigger (save to session store on changes)
  - Add type-safe getters and setters
  - _Requirements: 1.1, 1.3, 7.1_

- [x] 14. Implement player store (Pinia)
  - Create `src/stores/player.ts` with player profile and progression:
    - State: `profile` with XP, difficulty tier, match stats, study deck
    - Computed: `currentDifficulty`, `totalMatches`, `winRate`
    - Actions: `initializeProfile()`, `recordMatchResult()`, `adjustDifficulty()`, `updateAccessibilityPreference()`, `setLanguage()`
  - Implement difficulty tier adjustment logic (3 wins/losses)
  - Maintain accessibility and language preferences
  - _Requirements: 4.5, 6.1, 6.2, 8.1_

- [x] 15. Implement codex store (Pinia)
  - Create `src/stores/codex.ts` for card library and learning:
    - State: `cardLibrary`, `scenarioLibrary`, `codexEntries`, `searchResults`
    - Computed: `cardsByDomain`, `cardsByDifficulty`
    - Actions: `loadCardLibrary()`, `searchCards()`, `getCodexEntry()`, `filterByDomain()`
  - Implement search functionality with tagging system
  - Support filtering by domain, cost, synergy tags
  - _Requirements: 5.1, 5.2_

- [x] 16. Implement session store (Pinia) for persistence
  - Create `src/stores/session.ts` for save/load functionality:
    - State: `savedSession`
    - Actions: `saveSession()`, `loadSession()`, `clearSession()`, `hasValidSession()`
    - Implement LocalStorage adapter for session data
    - Handle 7-day expiration logic
  - Test save/restore roundtrip with LocalStorage
  - _Requirements: 7.1, 7.2, 7.3_

---

### Phase 4: Game Engine Implementation

- [x] 17. Implement ValidationEngine core logic
  - Create `src/engine/validator.ts` with `ValidationEngine` class:
    - Implement `validatePlacement()` method with <500ms target
    - Implement constraint checking: cost, requirements, conflicts, anti-patterns
    - Add `isSlotTypeCompatible()` helper method
    - Add `checkRequirements()` and `detectConflicts()` methods
    - Add `detectAntiPatterns()` for Azure best practices validation
    - Implement `getSuggestions()` for violation resolution
  - Write implementation with performance optimization (early exit patterns)
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3_

- [x] 18.* Write property test for ValidationEngine
  - **Property 1: Validation completes within performance budget**
  - **Property 2: Invalid placements identify all constraint violations**
  - **Property 5: Budget violations are correctly calculated**
  - Create `tests/unit/engine/validator.test.ts` with property-based tests
  - Test validation response time under <500ms target
  - Test violation detection for all constraint types
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [x] 19. Implement ScoringEngine with three-dimensional scoring
  - Create `src/engine/scoring.ts` with `ScoringEngine` class:
    - Implement `calculateScore()` method returning `ArchitectureScore`
    - Implement `calculateHighAvailabilityScore()` (0-100):
      - Base points for HA cards, multi-region bonus, managed service bonus
      - Load balancing bonus, backup/recovery bonus
      - Penalty for single points of failure
    - Implement `calculateCostEffectivenessScore()` (0-100):
      - Optimal utilization scoring (70-90% range)
      - PaaS and serverless preference bonuses
      - Reserved capacity bonus
    - Implement `calculateSecurityComplianceScore()` (0-100):
      - Points for identity, network security, encryption, governance, monitoring
      - Backup and DR points
    - Implement `createBreakdown()` for detailed score metadata
  - _Requirements: 1.3, 1.4, 4.1_

- [x] 20.* Write property tests for ScoringEngine
  - **Property 3: Valid placements trigger score updates**
  - **Property 4: Complete solutions provide score breakdown**
  - **Property 6: Conflicts prevent score updates**
  - **Property 9: Multiplayer scoring is deterministic and bounded**
  - Create `tests/unit/engine/scoring.test.ts` with property-based tests
  - Test score components remain in [0, 100] range
  - Test total score equals sum of three components
  - Test scores increase with valid card additions
  - _Requirements: 1.3, 1.4, 4.1_

- [x] 21. Implement EvaluatorEngine for multiplayer clash
  - Create `src/engine/evaluator.ts` with `EvaluatorEngine` class:
    - Implement `evaluateClash()` method comparing two solutions
    - Implement winner determination logic (higher score wins, ties for equal scores)
    - Implement `calculateXPAward()` method: 50 + margin of victory
    - Return detailed clash result with both scores and winner
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 22.* Write property tests for EvaluatorEngine
  - **Property 10: Higher score determines winner**
  - **Property 11: Identical scores result in tie**
  - **Property 12: XP calculation follows formula**
  - Create `tests/unit/engine/evaluator.test.ts`
  - Test winner determination with various score combinations
  - Test XP calculation matches formula
  - Test tie handling with score equality
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 23. Create performance monitoring utility
  - Create `src/utils/performance.ts` with monitoring utilities:
    - `createDebouncedValidator()` for real-time validation debouncing
    - `createMemoizedScorer()` for score caching
    - `lazyLoadImage()` for image optimization
    - `PerformanceMonitor` class for timing measurements
  - Add logging for slow operations (>500ms validation)
  - _Requirements: 1.1, 1.2 (performance targets)_

- [x] 24. Create error handling composable
  - Create `src/composables/useErrorHandler.ts`:
    - `handleError()` method for error logging and user feedback
    - `handleValidationError()` for validation-specific errors
    - `handleSessionError()` for persistence errors
    - Error boundary integration points
  - Add error logging to LocalStorage for debugging
  - _Requirements: 2.1, 2.4_

---

### Phase 5: UI Components - Foundational

- [x] 25. Create base UI components with accessibility
  - Create `src/components/ui/Button.vue` with:
    - TypeScript props with `<script setup>`
    - Full keyboard support (Enter/Space activation)
    - Focus-visible styling for keyboard navigation
    - ARIA labels and descriptions
    - Tailwind styling with high-contrast support
  - Create `src/components/ui/Modal.vue` with:
    - Focus trap implementation
    - Escape key to close
    - Semantic HTML (`role="dialog"`)
    - ARIA labels and live regions
  - Create `src/components/ui/Select.vue` with accessible dropdown
  - Create `src/components/ui/Toast.vue` for notifications
  - _Requirements: 8.1 (keyboard navigation)_

- [x] 26.* Write unit tests for base UI components
  - Create `tests/unit/components/ui/Button.test.ts`
  - Test keyboard activation (Enter, Space keys)
  - Test focus management and aria-labels
  - Test high-contrast mode rendering
  - _Requirements: 8.1, 8.2_

- [x] 27. Create Card component (presentation)
  - Create `src/components/cards/AzureCard.vue`:
    - Props: `card` (AzureCard), `isPlaced`, `isValid`, `isDraggable`
    - Emits: `dragStart`, `dragEnd`, `click`, `tooltipRequest`
    - Display card name, domain, cost, description
    - Compute card classes based on domain, validity state, placement
    - Drag and drop support with visual feedback
    - Keyboard activation (Enter to select)
    - ARIA labels and descriptions
    - Dynamic domain-specific styling (colors)
  - _Requirements: 1.1, 5.3, 8.1_

- [x] 28. Create CardTooltip component
  - Create `src/components/cards/CardTooltip.vue`:
    - Display quick-reference tooltip (<280 characters)
    - Show AZ-900 exam tip
    - Position relative to card with Popper.js
    - Keyboard accessible (Tab to show/hide)
    - Tooltip: `role="tooltip"` with ARIA
  - _Requirements: 5.3_

- [x] 29. Create ArchitectureSlot component (drop zone)
  - Create `src/components/board/ArchitectureSlot.vue`:
    - Props: `slot` (ArchitectureSlot), `isValid`
    - Display slot type indicator and position
    - Support drag-and-drop (dragover, drop events)
    - Display placed card if occupied
    - Highlight on drag-over for visual feedback
    - Keyboard accessible (arrow keys to navigate, Enter to place)
    - ARIA labels for slot purpose
  - _Requirements: 1.1, 8.1_

- [x] 30. Create CardDeck component (hand display)
  - Create `src/components/game/CardDeck.vue`:
    - Props: `cards` (AzureCard[])
    - Display available cards in hand in grid layout
    - Support drag from card to slot
    - Show card count and filtering options
    - Keyboard navigation (Tab between cards, Space to drag)
    - Accessible list structure with ARIA
  - _Requirements: 1.1_

- [x] 31. Create ScenarioPanel component
  - Create `src/components/game/ScenarioPanel.vue`:
    - Props: `scenario` (Scenario)
    - Display scenario title and description
    - Display requirements list with weights
    - Display constraints (budget, availability, security level)
    - Color-coded requirement status (met/unmet)
    - Semantic HTML with ARIA descriptions
  - _Requirements: 1.1, 1.2_

- [x] 32. Create ScoreDisplay component
  - Create `src/components/game/ScoreDisplay.vue`:
    - Props: `score` (ArchitectureScore)
    - Display three score components (HA, Cost, Security) with progress bars
    - Show score breakdown with labels
    - Color-coded score levels (red/yellow/green)
    - Display total score prominently
    - Accessible progress bars with aria-valuenow
  - _Requirements: 1.3, 1.4_

- [x] 33. Create ValidationFeedback component
  - Create `src/components/game/ValidationFeedback.vue`:
    - Props: `result` (ValidationResult)
    - Display violation list with icons
    - Show violated principle names
    - Display suggestions with action buttons
    - Success message for valid placements
    - ARIA alerts for error announcements
  - _Requirements: 1.2, 2.1, 2.3_

- [x] 34. Create TimerBar component
  - Create `src/components/game/TimerBar.vue`:
    - Props: `timeRemaining` (seconds), `totalTime` (seconds)
    - Display animated progress bar
    - Color change as time runs out (green → yellow → red)
    - Show time in MM:SS format
    - Warning alert when <10 seconds
    - ARIA live region for time updates
  - _Requirements: 3.1_

---

### Phase 6: UI Components - Complex/Smart

- [x] 35. Create GameBoard component (container)
  - Create `src/components/game/GameBoard.vue`:
    - Props: `mode` ('quick-match' | 'multiplayer'), `timeLimit?`
    - Emits: `cardPlaced`, `solutionSubmitted`, `matchComplete`
    - Layout: ScenarioPanel (left), CardDeck (bottom), ArchitectureSlots (center), ScoreDisplay (right)
    - Integrate validation engine on card placement
    - Integrate scoring engine on score updates
    - Responsive grid layout with Tailwind
    - Keyboard navigation between all zones
  - _Requirements: 1.1, 1.3, 8.1_

- [x] 36. Create CodexBrowser component (learning view)
  - Create `src/components/codex/CodexBrowser.vue`:
    - Display card library in filterable grid
    - Search functionality by card name or tag
    - Filter by domain and cost tier
    - Click card to view detailed CodexEntry
    - Sort by domain or cost
    - Responsive two-column layout
    - Full keyboard navigation
  - _Requirements: 5.1, 5.2, 8.1_

- [x] 37. Create CodexEntry component (detail view)
  - Create `src/components/codex/CodexEntry.vue`:
    - Props: `cardId`, `entry` (CodexEntry)
    - Display exam definition
    - Show use cases and best practices
    - Link related services
    - Display external resource links
    - Add to Study Deck button
    - Back to list button
  - _Requirements: 5.2, 5.4_

- [x] 38. Create StudyDeck component
  - Create `src/components/codex/StudyDeck.vue`:
    - Display player's collected cards
    - Sort and filter options
    - Show only unique cards (no duplicates)
    - Link to full codex entry for each card
    - Progress indicator (cards collected / total)
    - Keyboard navigation through study cards
  - _Requirements: 5.5, 5.6_

- [x] 39.* Write component tests for game UI
  - Create `tests/unit/components/GameBoard.test.ts`
  - Test card placement interactions
  - Test validation feedback display
  - Test score calculation trigger
  - _Requirements: 1.1, 1.3_

---

### Phase 7: Game Views (Screens)

- [x] 40. Create HomeView (main menu)
  - Create `src/views/HomeView.vue`:
    - Display title and branding
    - Show two main buttons: "3-Minute Commute Mode", "Multiplayer Challenge"
    - Settings and Codex links in navigation
    - Display player name and XP if available
    - Tutorial/help link for first-time players
    - Responsive layout with Tailwind
    - Keyboard accessible navigation
  - _Requirements: 3.1, 4.1_

- [x] 41. Create QuickMatchView (single-player quick mode)
  - Create `src/views/QuickMatchView.vue`:
    - Initialize quick-match mode (45-second timer, 3 scenarios)
    - Use GameBoard component
    - Use TimerBar component
    - Auto-submit on timer expiry
    - Show scenario progression (1/3, 2/3, 3/3)
    - Display final results with total score
    - "Save for Later" and "New Game" buttons
    - Exit confirmation dialog
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 42. Create MultiplayerView (two-player clash)
  - Create `src/views/MultiplayerView.vue`:
    - Display match setup (player names, scenario display)
    - Two GameBoard instances side-by-side
    - Synchronized timer for both players
    - Lock solution submission (can't change after submit)
    - Show clash results: winner, score comparison, XP awarded
    - "Play Again" and "Main Menu" buttons
    - Responsive layout (stack on mobile)
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 43. Create CodexView (learning library)
  - Create `src/views/CodexView.vue`:
    - Use CodexBrowser as main component
    - Full-page layout with side navigation
    - Search and filter controls
    - Integration with StudyDeck display
    - Modal for CodexEntry details
    - Keyboard navigation through entire view
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 44. Create SettingsView (preferences)
  - Create `src/views/SettingsView.vue`:
    - Language selector (en, zh-CN, ja, es, de, fr)
    - Accessibility options:
      - High contrast mode toggle
      - Keyboard-only mode toggle
      - Reduced motion toggle
    - Difficulty tier indicator
    - Player name editor
    - Clear data button with confirmation
    - Resume game button if session exists
    - Back to Home button
  - _Requirements: 6.1, 8.1, 8.2, 8.3_

- [x] 45. Create AppLayout component (header/footer)
  - Create `src/components/layout/AppHeader.vue`:
    - Navigation menu (Home, Game, Codex, Settings)
    - Player name and XP display
    - Language indicator
    - Hamburger menu for mobile
    - Logo and title
    - Skip to main content link (accessibility)
  - Create `src/components/layout/AppFooter.vue`:
    - Settings and feedback links
    - Version info
    - Azure credits
  - _Requirements: 8.1_

---

### Phase 8: Accessibility & Localization

- [x] 46. Set up Vue I18n configuration
  - Create `src/i18n/index.ts`:
    - Initialize Vue I18n with lazy loading
    - Configure fallback locale (English)
    - Set up message format options
    - Create composition API helper `useI18n()`
  - Create `src/i18n/locales/` directory
  - _Requirements: 8.3, 8.5_

- [x] 47. Create translation files for all supported languages
  - Create JSON translation files for 6 languages:
    - `en.json` (English - base)
    - `zh-CN.json` (Simplified Chinese)
    - `ja.json` (Japanese)
    - `es.json` (Spanish)
    - `de.json` (German)
    - `fr.json` (French)
  - Include all UI labels, card names, error messages, tutorials
  - Validate all keys present in all files
  - _Requirements: 8.3, 8.4_

- [x] 48.* Write property test for translation completeness
  - **Property 22: Translation completeness per language**
  - **Property 23: Missing translations fallback to English**
  - Create `tests/unit/i18n/translations.test.ts`
  - Test all translation files have same keys
  - Test fallback behavior
  - _Requirements: 8.3, 8.5_

- [x] 49. Implement keyboard navigation system
  - Create `src/composables/useKeyboardNavigation.ts`:
    - `useTab()` for Tab key navigation
    - `useArrowKeys()` for arrow key navigation
    - `useEscape()` for escape key handling
    - `useFocus()` for focus management
    - Prevent default browser behavior where needed
    - Focus visible state management
  - Test with screen reader (NVDA/JAWS conceptually)
  - _Requirements: 8.1_

- [x] 50. Implement high-contrast mode support
  - Create `src/composables/useHighContrast.ts`:
    - Detect system preference (prefers-contrast media query)
    - Toggle high-contrast class on document root
    - Persist preference to LocalStorage
    - Apply to all components via CSS classes
  - Update all components to support high-contrast:
    - Increase border widths
    - Use solid fills instead of gradients
    - Increase text-to-background contrast
    - Use patterned backgrounds for color-blind support
  - _Requirements: 8.2_

- [x] 51. Create accessibility guide and test checklist
  - Document keyboard navigation patterns for all views
  - Create checklist for WCAG 2.1 AA compliance:
    - Color contrast ratios
    - Focus indicators
    - ARIA labels and descriptions
    - Semantic HTML structure
    - Keyboard operability
  - Create testing guide for screen readers
  - _Requirements: 8.1, 8.2_

---

### Phase 9: Session Persistence & Storage

- [x] 52. Implement LocalStorage adapter for session save
  - Create `src/utils/storageAdapter.ts`:
    - `saveToLocalStorage()` method
    - `loadFromLocalStorage()` method
    - `clearFromLocalStorage()` method
    - JSON serialization with validation
    - Error handling for quota exceeded
    - Type-safe storage with TypeScript
  - _Requirements: 7.1, 7.2_

- [x] 53. Implement session expiration logic
  - Add expiration timestamp to `SavedSession` (7 days)
  - Create `src/utils/sessionExpiration.ts`:
    - `calculateExpirationTime()` method
    - `isSessionExpired()` method
    - `cleanupExpiredSessions()` method
  - Test expiration edge cases (midnight boundary, timezone)
  - _Requirements: 7.3_

- [x] 54. Implement IndexedDB adapter for extended persistence
  - Create `src/utils/indexedDbAdapter.ts`:
    - Set up IndexedDB database and object stores
    - Store game state, player profile, codex data
    - Implement versioning for schema migrations
    - Async operations with Promise handling
  - _Requirements: 7.1, 7.2_

- [x] 55. Create session resume workflow
  - Create `src/composables/useSessionResume.ts`:
    - Check for saved session on app load
    - Validate session data integrity
    - Restore game state to UI
    - Show "Resume Game" option if valid session exists
    - Handle expired or corrupted sessions gracefully
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 56.* Write integration tests for persistence
  - Create `tests/integration/persistence.test.ts`
  - Test save/restore roundtrip
  - Test expiration detection
  - Test corrupted data handling
  - Test storage quota errors
  - _Requirements: 7.1, 7.2, 7.3_

---

### Phase 10: Testing (Unit, Integration, E2E)

- [x] 57. Write comprehensive unit tests for game engines
  - Create `tests/unit/engine/validator.test.ts` (30-40 test cases):
    - Test each constraint type validation
    - Test cost calculation accuracy
    - Test conflict detection
    - Test anti-pattern detection
    - Test performance (<500ms)
  - Create `tests/unit/engine/scoring.test.ts` (25-30 test cases):
    - Test HA score calculation
    - Test cost score calculation
    - Test security score calculation
    - Test score boundaries [0, 300]
    - Test score breakdown accuracy
  - Create `tests/unit/engine/evaluator.test.ts` (15-20 test cases):
    - Test winner determination
    - Test tie handling
    - Test XP calculation
  - Target: 85% code coverage for game engine
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 4.1, 4.2, 4.3_

- [x] 58. Write unit tests for Pinia stores
  - Create `tests/unit/stores/game.test.ts`:
    - Test state initialization
    - Test card placement action
    - Test score updates
    - Test game state transitions
  - Create `tests/unit/stores/player.test.ts`:
    - Test profile initialization
    - Test difficulty tier adjustment
    - Test match result recording
  - Create `tests/unit/stores/session.test.ts`:
    - Test save/load operations
    - Test expiration detection
  - Target: 80% coverage for store logic
  - _Requirements: 1.1, 1.3, 6.1, 6.2_

- [x] 59. Write component snapshot tests
  - Create `tests/unit/components/` test files for all major components:
    - CardComponent snapshot
    - ArchitectureSlot snapshot
    - GameBoard snapshot
    - ScoreDisplay snapshot
  - Update snapshots on intentional UI changes
  - _Requirements: (visual regression prevention)_

- [x] 60. Write integration tests for game flow
  - Create `tests/integration/game-flow.test.ts`:
    - Test complete quick-match flow (3 scenarios)
    - Test card placement and validation
    - Test score calculation end-to-end
    - Test difficulty tier progression (3 wins/losses)
    - Test session save/resume
  - Target: 70% integration coverage
  - _Requirements: 1.1, 1.3, 3.1, 3.2, 6.1, 6.2, 7.1_

- [x] 61. Write E2E tests with Playwright
  - Create `tests/e2e/quick-match.spec.ts`:
    - Complete quick-match game flow
    - Verify all three scenarios load
    - Verify timer counts down
    - Verify auto-submit on timer expiry
    - Verify final score display
  - Create `tests/e2e/multiplayer.spec.ts`:
    - Two-player solution clash
    - Winner determination
    - XP award display
  - Create `tests/e2e/accessibility.spec.ts`:
    - Full keyboard navigation
    - Screen reader compatibility (ARIA)
    - High-contrast mode toggle
    - Focus management
  - Create `tests/e2e/localization.spec.ts`:
    - Language switching
    - All UI text updates
    - Missing translation handling
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 62. Create test utilities and fixtures
  - Create `tests/fixtures/cards.ts` with mock card data
  - Create `tests/fixtures/scenarios.ts` with mock scenarios
  - Create `tests/fixtures/gameState.ts` with mock game states
  - Create `tests/helpers/render.ts` Vue component test helper
  - Create `tests/helpers/assertions.ts` custom matchers
  - _Requirements: (testing infrastructure)_

---

### Phase 11: Performance Optimization & Monitoring

- [x] 63. Implement performance monitoring
  - Create `src/utils/performanceMonitor.ts`:
    - Add timing around validation (<500ms target)
    - Add timing around scoring calculations
    - Add metrics for component render time
    - Log slow operations to LocalStorage
    - Export metrics for analysis
  - _Requirements: 1.1, 1.2_

- [x] 64. Optimize bundle size and code splitting
  - Configure Vite code splitting in `vite.config.ts`:
    - Manual chunks for game engine, UI components
    - Route-based splitting (Home, Game, Codex views)
    - Vendor chunk for node_modules
  - Target: <500KB initial bundle
  - _Requirements: (performance)_

- [x] 65. Implement lazy loading for images and data
  - Create `src/utils/lazyLoader.ts`:
    - Lazy load card images
    - Lazy load scenario descriptions
    - Intersection Observer API for viewport
  - Use dynamic imports for large components
  - _Requirements: (performance)_

- [x] 66. Set up error tracking and logging
  - Create `src/utils/errorTracking.ts`:
    - Log errors to LocalStorage (last 50)
    - Categorize errors by type
    - Include stack traces in development
    - Show user-friendly error messages
  - Integrate with error boundary components
  - _Requirements: 2.1_

---

### Phase 12: Build & GitHub Pages Deployment

- [x] 67. Configure production build and optimization
  - Configure Vite production minification and source maps
  - Enable CSS code splitting and asset optimization
  - Configure manual chunks for game engine, UI, game data, and vendor dependencies
  - Keep TypeScript strict mode and environment templates
  - _Requirements: (deployment infrastructure)_

- [x] 68. Configure GitHub Pages SPA deployment
  - Use GitHub Pages instead of Azure Static Web Apps
  - Configure Vite base path for the repository GitHub Pages URL
  - Provide GitHub Pages SPA deployment workflow
  - Validate static asset paths and client-side routing considerations
  - _Requirements: (deployment)_

- [x] 69. Configure GitHub Actions CI/CD pipeline
  - Create `.github/workflows/deploy-pages.yml`
  - Run lint, format check, type check, unit tests, and production build
  - Upload the `dist/` artifact for GitHub Pages
  - Deploy to GitHub Pages on `main` push
  - Support manual workflow dispatch
  - _Requirements: (deployment infrastructure)_

- [x] 70. Create deployment documentation
  - Document GitHub Pages environment setup and deployment process
  - Document repository Pages configuration
  - Create rollback procedures
  - Document monitoring and error tracking
  - Create troubleshooting guide for common issues
  - _Requirements: (deployment documentation)_

---

### Phase 13: Documentation & Quality Assurance

- [ ] 71. Create comprehensive code documentation
  - Add JSDoc comments to all exported functions and classes
  - Create README.md for project setup and development
  - Document store APIs and usage patterns
  - Document component prop interfaces
  - Create style guide for Vue components
  - _Requirements: (documentation)_

- [ ] 72. Create user-facing documentation
  - Game tutorial/onboarding guide
  - How to play quick-match mode
  - How to use the Architecture Codex
  - Accessibility features guide
  - Keyboard shortcuts reference
  - _Requirements: (user documentation)_

- [ ] 73. Conduct final QA and regression testing
  - Run full test suite with coverage reporting
  - Manual testing of all game flows
  - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
  - Test on mobile devices (iOS Safari, Android Chrome)
  - Performance testing (Lighthouse audit)
  - Accessibility audit (axe DevTools, WAVE)
  - _Requirements: (quality assurance)_

- [ ] 74. Fix critical bugs and accessibility issues
  - Address any bugs found during QA
  - Fix accessibility violations (WCAG 2.1 AA)
  - Optimize performance bottlenecks
  - Improve error messages based on feedback
  - _Requirements: 8.1, 8.2_

---

## Checkpoints

### Checkpoint: Core Game Engine Complete (After Phase 4)
- Ensure all properties 1-6 pass validation tests
- Validate <500ms response time for validation
- Confirm scoring logic returns correct ranges
- Test all requirement types are validated

## Checkpoint: Full UI Implementation (After Phase 7)
- All views render without errors
- Navigation between screens works
- Game board accepts card placements
- Score displays update in real-time
- Validation feedback shows correctly

## Checkpoint: Accessibility Complete (After Phase 8)
- Full keyboard navigation works
- High-contrast mode renders correctly
- All translations present and functional
- Screen reader compatibility verified

## Checkpoint: Persistence Working (After Phase 9)
- Session save/restore roundtrip successful
- Expiration logic functions correctly
- No data loss on browser close
- Corrupted data handled gracefully

## Checkpoint: Testing Coverage (After Phase 10)
- 85% coverage for game engine
- 80% coverage for stores
- 70% integration coverage
- All E2E flows pass

---

## Notes

- Tasks marked with `*` are optional testing sub-tasks that can be skipped for MVP
- Each task references specific acceptance criteria from requirements.md
- Estimated effort ranges from 2-4 hours per small task to 8-12 hours for large tasks
- Dependency graph follows in next section
- All components built with Vue 3 Composition API using `<script setup>`
- All code must pass TypeScript strict mode
- All components must be accessible (WCAG 2.1 AA)
- Styling uses Tailwind CSS utility classes

---

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1", "2", "3", "4", "5", "6"],
      "description": "Project setup and tooling foundation"
    },
    {
      "id": 1,
      "tasks": ["7", "8", "9", "10", "11", "12"],
      "description": "Core data models and type definitions"
    },
    {
      "id": 2,
      "tasks": ["13", "14", "15", "16"],
      "description": "Pinia state management stores"
    },
    {
      "id": 3,
      "tasks": ["17", "19", "21", "23", "24"],
      "description": "Game engine implementation (core logic)"
    },
    {
      "id": 4,
      "tasks": ["18", "20", "22"],
      "description": "Game engine property-based tests"
    },
    {
      "id": 5,
      "tasks": ["25", "27", "28", "29", "30", "31", "32", "33", "34"],
      "description": "Foundational UI components"
    },
    {
      "id": 6,
      "tasks": ["26"],
      "description": "UI component unit tests"
    },
    {
      "id": 7,
      "tasks": ["35", "36", "37", "38"],
      "description": "Complex/smart container components"
    },
    {
      "id": 8,
      "tasks": ["39"],
      "description": "Container component tests"
    },
    {
      "id": 9,
      "tasks": ["40", "41", "42", "43", "44", "45"],
      "description": "Game views (screens) and layout"
    },
    {
      "id": 10,
      "tasks": ["46", "47"],
      "description": "Internationalization (i18n) setup"
    },
    {
      "id": 11,
      "tasks": ["48"],
      "description": "I18n testing"
    },
    {
      "id": 12,
      "tasks": ["49", "50", "51"],
      "description": "Accessibility features (keyboard, high-contrast)"
    },
    {
      "id": 13,
      "tasks": ["52", "53", "54", "55"],
      "description": "Session persistence and storage"
    },
    {
      "id": 14,
      "tasks": ["56"],
      "description": "Persistence integration tests"
    },
    {
      "id": 15,
      "tasks": ["57", "58", "59", "60", "61", "62"],
      "description": "Comprehensive test suite (unit, integration, E2E)"
    },
    {
      "id": 16,
      "tasks": ["63", "64", "65", "66"],
      "description": "Performance optimization and monitoring"
    },
    {
      "id": 17,
      "tasks": ["67", "68", "69"],
      "description": "Build configuration and GitHub Pages deployment setup"
    },
    {
      "id": 18,
      "tasks": ["70", "71", "72"],
      "description": "Documentation and guides"
    },
    {
      "id": 19,
      "tasks": ["73", "74"],
      "description": "Final QA, testing, and bug fixes"
    }
  ]
}
```

---

## Implementation Roadmap

### Week 1: Foundation & Data Layer
- **Wave 0**: Project setup, tooling, configurations (Tasks 1-6)
- **Wave 1**: Type definitions and data models (Tasks 7-12)
- **Outcome**: Project ready, all types defined, card/scenario data loaded

### Week 2: Game Engine & State Management
- **Wave 2**: Pinia stores initialized (Tasks 13-16)
- **Wave 3**: Game engine implementation (Tasks 17, 19, 21, 23-24)
- **Wave 4**: Engine property tests (Tasks 18, 20, 22)
- **Outcome**: Core game logic working, all engines validated, <500ms response times

### Week 3: UI Components & Views
- **Wave 5**: Foundational UI components (Tasks 25, 27-34)
- **Wave 6**: Component unit tests (Task 26)
- **Wave 7**: Smart container components (Tasks 35-38)
- **Wave 8**: Container tests (Task 39)
- **Wave 9**: Game views (Tasks 40-45)
- **Outcome**: All UI rendered, game board interactive, views navigate correctly

### Week 4: Accessibility & Persistence
- **Wave 10-12**: Internationalization and accessibility (Tasks 46-51)
- **Wave 13**: Persistence implementation (Tasks 52-55)
- **Wave 14**: Persistence tests (Task 56)
- **Outcome**: All languages working, keyboard/high-contrast functional, save/resume working

### Week 5: Testing, Performance, Deployment
- **Wave 15**: Full test suite (Tasks 57-62)
- **Wave 16**: Performance optimization (Tasks 63-66)
- **Wave 17**: Build and GitHub Pages deployment setup (Tasks 67-69)
- **Outcome**: 85% engine coverage, optimized bundle, ready for GitHub Pages deployment

### Week 6: Documentation & Final QA
- **Wave 18**: Documentation (Tasks 70-72)
- **Wave 19**: Final QA and bug fixes (Tasks 73-74)
- **Outcome**: Feature complete, documented, production-ready

---

**Estimated Total Effort**: 120-140 hours (15-17 working days for one developer, or parallel work for team)

**Key Success Metrics**:
- ✅ Validation completes <500ms
- ✅ 85% test coverage for game engine
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ 6 supported languages with 100% translation coverage
- ✅ <500KB production bundle size
- ✅ 7-day session persistence working
- ✅ Multiplayer clash evaluation accurate
- ✅ Lighthouse score >90 all categories
