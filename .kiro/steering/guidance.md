---
inclusion: always
---

## Code Delivery — Mode Detection

At the start of each conversation, detect which mode you are running in and read the matching guidance file. Do this before responding to the user for the first time. Do not load both.

- If you are running inside an IDE, read `.kiro/instructions/ide-mode.md` and follow its rules.
- Otherwise, you are in **CLI mode** → read `.kiro/instructions/cli-mode.md` and follow its rules.

## Current Project Context

- This repository is the Vue 3 + TypeScript Azure AZ-900 Card Clash game. Follow `az900-domain-rules.md` for card, scenario, and topology content and `tech-stack-guide.md` for implementation conventions.
- The deployed application is GitHub Pages. Preserve Vite's repository base and Vue Router hash history; deployed routes use the form `/#/route`.
- The in-game AZ-900 knowledge topology is `src/views/TopologyMapView.vue`. It includes separate, expanded learning paths for Days 7 and 27–30, informed by the learner's `linjinhsien/ithome_az-900` articles and `linjinhsien/linjinhsien.github.io` practice pages. Keep these learning paths distinct and retain their source links.
- Prefer current Microsoft Learn and the official AZ-900 skills outline for service facts. Treat supplementary study articles, historical questions, and practice scenarios as study aids rather than official exam guidance.
- Keep guidance aligned with the existing code and package scripts. Do not propose an alternative framework, hosting platform, or dependency without an explicit reason.
