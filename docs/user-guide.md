# User Guide

## Goal
Azure AZ-900 Card Clash Engine is a scenario-based learning game. Build an architecture that satisfies the scenario, then review validation and score feedback.

## Quick Match
1. Open **3-Minute Commute Mode** from the home screen.
2. Review scenario requirements and constraints.
3. Select a card and place it in a compatible architecture slot.
4. Review validation feedback.
5. Complete the architecture before the timer expires.
6. Submit the solution and review the score breakdown.
7. Use **Save for Later** to resume a quick-match session.

Quick-match sessions are stored locally and expire after seven days.

## Architecture Codex
- Search by service name, description, exam tip, or synergy tag.
- Filter by AZ-900 domain, maximum cost, or synergy tag.
- Open a card to review its exam definition, use cases, best practices, related services, and learning resources.
- Add useful cards to the Study Deck.

## Multiplayer
Multiplayer compares two architecture solutions for the same scenario and returns both scores, the margin, and the outcome.

## Accessibility
The application supports keyboard navigation, visible focus states, skip navigation, high-contrast presentation, reduced-motion preferences where applicable, and accessible labels/roles/live regions.

## Keyboard Shortcuts
| Action | Keyboard |
|---|---|
| Move through interactive controls | Tab / Shift+Tab |
| Activate a focused control | Enter / Space |
| Close a dialog | Escape |
| Navigate supported game areas | Arrow keys |

## Languages
Available locales are English (en), Simplified Chinese (zh-CN), Japanese (ja), Spanish (es), German (de), and French (fr). Change the language from **Settings**; the selection is persisted locally.

## Session and Privacy
Game/session data and player preferences are stored in the browser. Browser storage can be cleared from the browser's site-data controls.

## Troubleshooting
### Nested page returns 404 on GitHub Pages
The application is a Vite SPA. Use the production site entry point and the deployed SPA fallback for client-side routes.

### Game looks stale after deployment
Refresh after a new deployment. If necessary, clear cached site data and reload.

### Saved game cannot be restored
The session may have expired, been cleared, or failed validation. Start a new match if the saved state is unavailable.
