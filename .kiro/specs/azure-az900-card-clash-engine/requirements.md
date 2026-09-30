# Requirements Document

## Introduction

Azure AZ-900 Architecture Card Clash Engine is an interactive, scenario-driven card game that teaches Azure AZ-900 certification concepts through gameplay. Players deploy Azure Service Cards to fulfill architectural scenario requirements in single-player quick matches or multiplayer battles. The game validates architectural decisions against AZ-900 principles, providing immediate feedback and learning opportunities.

## Glossary

- **Azure_Service_Card**: A digital card representing an Azure service (e.g., Azure VM, Blob Storage, Virtual Network) with associated metadata including service category, cost tier, and AZ-900 exam relevance.
- **Architecture_Slot**: A designated drop zone on the game board where players place Azure Service Cards to construct their solution.
- **Scenario_Constraints**: The specific requirements and limitations defined for each architecture scenario (e.g., budget limits, availability requirements, security compliance needs).
- **Architecture_Score**: A numerical value representing how well a player's card deployment meets the scenario constraints and Azure best practices.
- **Architecture_Codex**: An in-game reference guide containing AZ-900 exam definitions and explanations for each Azure service card.
- **Solution_Clash_Evaluator**: The game logic component that compares two multiplayer solutions against AZ-900 architectural principles.
- **High_Availability_Score**: A component of the Architecture Score measuring how well the solution provides redundancy and fault tolerance.
- **Cost_Effectiveness_Score**: A component of the Architecture Score measuring how efficiently the solution uses Azure resources within budget constraints.
- **Security_Compliance_Score**: A component of the Architecture Score measuring adherence to Azure security best practices.

## Requirements

### Requirement 1: Service Card Deployment Validation

**User Story:** As a player, I want to receive immediate feedback when I deploy Azure Service Cards, so that I can learn whether my architectural decisions are correct.

#### Acceptance Criteria

1. WHEN a player releases an Azure Service Card onto an Architecture Slot, THE Game_Engine SHALL determine if the service satisfies all active Scenario Constraints and SHALL display a validation result within 500 milliseconds.
2. IF an Azure Service Card does not satisfy one or more Scenario Constraints, THEN THE Game_Engine SHALL display an error indicator specifying which constraints were violated within 500 milliseconds.
3. WHEN a valid Azure Service Card is placed in an Architecture Slot, THE Game_Engine SHALL update the Architecture Score within 500 milliseconds.
4. WHEN a player completes their architecture solution, THE Game_Engine SHALL display a breakdown of the Architecture Score showing High Availability Score, Cost Effectiveness Score, and Security Compliance Score.

### Requirement 2: Invalid Architecture Combo Handling

**User Story:** As a player, I want to understand why my architecture solution is invalid, so that I can learn Azure best practices and improve my AZ-900 knowledge.

#### Acceptance Criteria

1. IF a player submits a card combination that violates Azure architectural best practices, THEN THE Game_Engine SHALL display a validation error message that identifies the violated AZ-900 principle by name and describes the violation in 1 to 3 sentences.
2. IF a player submits a card combination that exceeds the scenario cost constraints, THEN THE Game_Engine SHALL display a budget warning showing the numeric cost overrun amount.
3. IF a player attempts to place incompatible services together (e.g., placing a public endpoint without a Network Security Group in a security-focused scenario), THEN THE Game_Engine SHALL visually distinguish the conflicting cards and display at least one AZ-900 compliant alternative card.
4. WHEN an invalid architecture combo is detected, THE Game_Engine SHALL prevent the Architecture Score from updating until the player removes or replaces one or more conflicting cards.

### Requirement 3: Commute Quick Match Mode

**User Story:** As a commuter, I want a quick-play mode with short turns, so that I can practice AZ-900 concepts during short transit periods.

#### Acceptance Criteria

1. WHILE the game is running in "3-Minute Commute Mode", THE Game_Engine SHALL restrict time limits to 45 seconds per turn.
2. WHILE the game is running in "3-Minute Commute Mode", THE Game_Engine SHALL randomly generate 3 AZ-900 architecture scenarios requiring placement of 3 to 5 cards each from the scenario database.
3. WHEN a player selects "3-Minute Commute Mode", THE Game_Engine SHALL initialize the game session within 3 seconds and display the first scenario.
4. WHEN the 45-second turn timer expires, THE Game_Engine SHALL automatically submit the current card configuration, display a visual indicator of auto-submission, and advance to the next scenario or end the match.
5. WHEN a player ends a "3-Minute Commute Mode" session before completing all 3 scenarios, THE Game_Engine SHALL display the final Architecture Score and offer to save the session for later completion.

### Requirement 4: Multiplayer Solution Clash

**User Story:** As a competitive learner, I want to compete against other players in solving architecture scenarios, so that I can test my AZ-900 knowledge against peers.

#### Acceptance Criteria

1. WHEN two players submit their Azure Service Card solutions for the same scenario, THE Solution_Clash_Evaluator SHALL evaluate both submissions based on High Availability Score (0 to 100), Cost Effectiveness Score (0 to 100), and Security Compliance Score (0 to 100), with Architecture Score calculated as the sum of these three components.
2. WHEN the Solution_Clash_Evaluator completes evaluation, THE Game_Engine SHALL declare the player with the higher combined Architecture Score as the winner.
3. IF both players achieve identical Architecture Scores, THEN THE Game_Engine SHALL declare a tie and offer both players 50 bonus XP points.
4. WHEN a multiplayer match concludes, THE Game_Engine SHALL display a side-by-side comparison of both solutions showing the individual score breakdowns for High Availability, Cost Effectiveness, and Security Compliance.
5. WHEN a player wins a multiplayer match, THE Game_Engine SHALL award XP points calculated as 50 plus the margin of victory and update the player's leaderboard ranking within 3 seconds.

### Requirement 5: AZ-900 Concept Learning Deck

**User Story:** As an AZ-900 exam candidate, I want access to detailed explanations of each Azure service card, so that I can study exam concepts while playing the game.

#### Acceptance Criteria

1. THE Game_Engine SHALL provide an in-game Architecture Codex accessible from the main menu and during gameplay.
2. WHEN a player views an Azure Service Card in the Architecture Codex, THE Game_Engine SHALL display the AZ-900 exam definition, service category, at least 2 common use cases, and at least 1 best practice recommendation.
3. WHEN a player clicks on an Azure Service Card during gameplay, THE Game_Engine SHALL display a quick-reference tooltip limited to 280 characters summarizing the AZ-900 exam relevance within 300 milliseconds.
4. THE Architecture Codex SHALL contain entries for all Azure Service Cards available in the game, organized by AZ-900 exam domains (Cloud Concepts, Azure Architecture, Azure Management, Security, and Networking).
5. WHEN a player completes a scenario, THE Game_Engine SHALL add the used Azure Service Cards to the player's Study Deck for later review in the Architecture Codex.
6. WHEN a player completes a scenario using Azure Service Cards already present in the Study Deck, THE Game_Engine SHALL not create duplicate entries in the Study Deck.

### Requirement 6: Scenario Progression and Difficulty Scaling

**User Story:** As a learner, I want the game to adapt to my skill level, so that I remain challenged but not overwhelmed.

#### Acceptance Criteria

1. WHEN a player wins three consecutive single-player matches within a single game session, THE Game_Engine SHALL increase the difficulty tier by one level for subsequent scenarios.
2. WHEN a player loses three consecutive single-player matches within a single game session, THE Game_Engine SHALL decrease the difficulty tier by one level for subsequent scenarios.
3. THE Game_Engine SHALL maintain exactly three difficulty tiers (Beginner, Intermediate, Advanced) corresponding to AZ-900 exam complexity levels.
4. WHEN a player starts a new game session, THE Game_Engine SHALL load scenarios tagged for the player's current difficulty tier.
5. WHEN a player at Beginner tier loses three consecutive matches, THE Game_Engine SHALL maintain the Beginner tier without decreasing further.
6. WHEN a player at Advanced tier wins three consecutive matches, THE Game_Engine SHALL maintain the Advanced tier without increasing further.

### Requirement 7: Session Persistence and Resume

**User Story:** As a mobile player, I want my game progress to persist between sessions, so that I can continue learning even if my commute is interrupted.

#### Acceptance Criteria

1. WHEN a player exits an active game session via closing the browser tab, navigating away from the game URL, or selecting a "Quit Game" option, THE Game_Engine SHALL save the current match state including deployed cards, Architecture Score, and remaining time within 2 seconds.
2. WHEN a player resumes a saved game session, THE Game_Engine SHALL restore the exact game state within 5 seconds or display an error message if restoration fails.
3. THE Game_Engine SHALL maintain game progress data for 7 days plus 0 to 23 hours and 59 minutes based on the save timestamp, after which the session shall be marked as expired and removed from storage.
4. WHEN a player attempts to resume an expired session, THE Game_Engine SHALL display a message indicating the session has expired and offer to start a new session.
5. WHEN a save operation is interrupted (e.g., browser crash, network failure), THE Game_Engine SHALL attempt to preserve the previous saved state if one exists.

### Requirement 8: Accessibility and Localization

**User Story:** As a diverse learner, I want the game to be accessible and available in my preferred language, so that I can learn AZ-900 concepts effectively.

#### Acceptance Criteria

1. THE Game_Engine SHALL support keyboard navigation for card deployment actions including selecting a card, selecting a deployment zone, confirming deployment, and canceling deployment, with a visible focus indicator of minimum 2px outline on the currently focused element.
2. THE Game_Engine SHALL provide a high-contrast visual mode that displays all text and interactive elements with a contrast ratio of at least 4.5:1 for normal text and at least 3:1 for large text.
3. THE Game_Engine SHALL display all game text including UI labels, card names, card descriptions, error messages, tutorial instructions, and menu items in the player's selected language from the supported language list (English, Simplified Chinese, Japanese, Spanish, German, French).
4. WHEN a player changes the language setting, THE Game_Engine SHALL update all displayed text within 2 seconds without requiring a restart.
5. IF a translation is unavailable for a text element in the selected language, THEN THE Game_Engine SHALL display the text in English as fallback and log the missing translation key.
