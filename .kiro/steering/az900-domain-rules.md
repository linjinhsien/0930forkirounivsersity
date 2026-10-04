# Steering Guide: AZ-900 Knowledge, Cards, Scenarios, and Topology

## Learning Content Sources

- Treat the current Microsoft AZ-900 skills outline and Microsoft Learn as the authority for exam objectives and service behavior.
- Use `linjinhsien/ithome_az-900` and `linjinhsien/linjinhsien.github.io` as the learner's preferred supplementary study sources. The topology has independent, detailed learning paths for Day 7 and Days 27–30; retain links to the corresponding Markdown articles and practice pages.
- The iThome articles are study material, not a substitute for checking current Microsoft terminology, exam scope, regional availability, or service behavior. Label historical or community-sourced exam material as such; do not present recalled questions or old exam claims as official.
- Keep the game focused on Azure AZ-900. Cross-cloud comparisons may explain an Azure concept, but do not represent AWS or Google Cloud services as Azure cards.

## Exam Domains

Every `AzureCard.domain` must be exactly one of the values in `src/types/game.ts`:

1. `cloud-concepts` — cloud benefits, deployment and service models, shared responsibility, CapEx/OpEx, scalability, elasticity, availability, and disaster recovery.
2. `azure-services` — Azure compute, networking, storage, databases, analytics, and other named Azure services.
3. `management-governance` — identity, access, governance, compliance, monitoring, cost management, and support.

Use the current official exam outline for domain names and weighting. Do not hard-code a percentage into learner-facing content unless it has been checked against the current outline.

## Card and Codex Data

- Card records live in `src/data/cards/{cloud-concepts,azure-services,management-governance}.json`.
- Each card must satisfy `AzureCard` in `src/types/game.ts` and the schema check in `src/utils/dataLoader.ts`: `id`, `name`, `domain`, `cost`, `synergyTags`, `az900ExamTip`, `description`, and `power`; `requirements` and `conflicts` are optional.
- Use stable, unique, descriptive IDs. Keep `synergyTags` consistent with the vocabulary used by `src/engine/validator.ts` and `src/engine/scoring.ts`.
- Add or update the matching `src/data/codex/{card-id}.json` entry when adding a card. Codex entries should explain the exam definition, use cases, best practices, related services, and learning resources.
- Keep card exam tips concise and distinguish a service's actual capabilities from game-specific scoring abstractions.
- A cross-cloud service such as BigQuery is not an Azure service card. If useful, explain it only as a clearly labelled comparison in learning material, not as an Azure answer.

## Scenarios and Game Behavior

- Scenario records live in `src/data/scenarios/{startup-scaling,enterprise-migration,high-compliance,real-time-analytics}.json` and must satisfy `Scenario` in `src/types/game.ts`.
- Write concrete requirements and constraints that point to cards players can actually receive and place. Check available cards, slot compatibility, declared prerequisites, cost, and the scoring/validation implementation before describing a solution as playable.
- Do not claim a scenario has one mandatory answer unless the engine enforces it. Explain acceptable alternatives where Azure has multiple valid designs.
- When changing initial hands or scenario-specific card selection, test that each scenario can offer cards relevant to its requirements. The current game store starts with the first eight cards from the loaded list; data order therefore affects card availability.
- Add scenario tests in `tests/unit/data/scenarios.test.ts` and gameplay coverage in `tests/e2e/` when scenario behavior changes.
- The game has four scenario categories: `startup-scaling`, `enterprise-migration`, `high-compliance`, and `real-time-analytics`.

## Knowledge Topology

- The interactive map is `src/views/TopologyMapView.vue`, served at `/#/topology`.
- Represent relationships as learning paths, not as claims that every adjacent service is a technical dependency.
- General paths cover cloud concepts, Azure resource hierarchy, global infrastructure, workload/traffic flow, identity/security/governance, and cost governance. Separate Day 7 and Day 27–30 paths expand stage review, cost management, scenario reasoning, and integrated architecture topics.
- Keep the Day 27 cost path distinct: Pricing Calculator estimates before deployment; Cost Management/Cost Analysis analyzes actual or forecast spend; Budgets and alerts track thresholds and notify; Tags support cost attribution; reservations, eligible savings offers, and Azure Hybrid Benefit may reduce eligible long-term costs.
- Important distinctions: a budget does not automatically stop resources by default; tags are metadata and do not grant access or protect resources; tags do not automatically inherit; RBAC grants access while Azure Policy evaluates or enforces configuration.
- Keep each Day 7 and Day 27–30 learning path independent and detailed, and preserve its links to both the supplementary Markdown article (where available) and the corresponding practice page in `linjinhsien/linjinhsien.github.io`.

## Validation and Scoring

- Follow the implemented behavior in `src/engine/validator.ts` and `src/engine/scoring.ts`; update tests when behavior changes.
- Explain validation feedback in AZ-900 terms. Do not imply a warning is a hard placement block unless the store actually rejects the placement.
- The displayed architecture score has High Availability, Cost Effectiveness, and Security Compliance components, each bounded from 0 to 100. Treat game scores as learning feedback, not as Azure guarantees or official exam scoring.
- Verify scenario requirements and expected card outcomes with focused unit and end-to-end tests.
