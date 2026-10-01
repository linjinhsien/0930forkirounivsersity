# Accessibility Guide

## Keyboard navigation

- Every interactive control must be reachable with the keyboard.
- Use Tab and Shift+Tab for sequential navigation.
- Use Enter or Space to activate buttons and selectable cards.
- Use Escape to close dialogs and cancel transient interactions.
- Keep a visible focus indicator.
- Every page should provide a skip link to the main content.

## Screen readers

- Prefer semantic HTML before adding ARIA.
- Give icon-only controls an accessible name.
- Use aria-label or aria-labelledby when visible text does not provide a name.
- Use aria-live="polite" for non-critical dynamic updates.
- Use role="alert" for validation errors that require immediate attention.
- Progress indicators should expose aria-valuenow, aria-valuemin, and aria-valuemax.

## High contrast

- Never communicate state with color alone.
- Keep text and borders distinguishable from the background.
- The high-contrast theme uses a solid black background, white text and borders, and a yellow accent.
- Respect prefers-contrast: more when the user has not saved an explicit preference.

## Reduced motion

- Respect the user's reduced-motion preference.
- Do not make animation necessary to understand state or complete an action.
- The global reduced-motion class disables transitions and animations.

## WCAG 2.1 AA checklist

- [ ] All controls are keyboard reachable.
- [ ] Focus order follows logical order.
- [ ] Focus indicators remain visible.
- [ ] Dialogs trap focus and close with Escape.
- [ ] Images have useful alternative text or are decorative.
- [ ] Dynamic status changes are announced appropriately.
- [ ] Text/background contrast meets WCAG 2.1 AA.
- [ ] Color is not the only indication of validation state.
- [ ] High-contrast mode remains usable.
- [ ] Reduced motion is respected.
- [ ] Page language is exposed through the html lang attribute.
- [ ] Every supported locale passes translation completeness tests.

## Manual screen-reader checks

Test the Home, Quick Match, Multiplayer, Codex, and Settings views with:
1. NVDA + Chrome on Windows.
2. JAWS + Edge on Windows.
3. VoiceOver + Safari on macOS or iOS.
4. TalkBack + Chrome on Android.

Record the page, control, expected announcement, observed announcement, and severity for each issue.
