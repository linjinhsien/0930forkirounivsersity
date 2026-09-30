# Steering Guide: Frontend Architecture & Code Style

## Tech Stack Guidelines

### Framework Selection
* **Primary Framework**: Vue 3 with Composition API using `<script setup>` syntax
* **Alternative Framework**: React 18+ with Functional Components and Hooks (if explicitly requested)
* **Key Decision Factors**:
  - Vue 3 for rapid prototyping and component-driven architecture
  - React for complex state management and enterprise-scale applications
  - Both must support TypeScript strict mode

### Language & Type Safety
* **TypeScript**: Version 5.0+ with strict mode enabled (`"strict": true`)
* **Type Safety Rules**:
  - NEVER use `any` type - always define explicit types
  - All component props and emits must have TypeScript interfaces
  - Use `unknown` instead of `any` for truly unknown types
  - Leverage generics for reusable utilities and components

### Styling System
* **Primary**: Tailwind CSS for utility-first styling
* **Design Principles**:
  - Mobile-first responsive design approach
  - Consistent spacing scale and color palette
  - Component-focused styling using `@apply` for custom components
  - Dark mode support using `dark:` variants
* **Component Library**: Use Headless UI or Radix Vue for accessible components

### State Management
* **Vue Ecosystem**: Pinia for centralized, modular state management
* **React Ecosystem**: Zustand or Jotai for simplified, atomic state
* **State Structure**:
  - Separate game state from UI state
  - Immutable updates using Immer or Vue's reactive system
  - Persistence layer for game progress

## Project Structure & Architecture

### Directory Organization
```
src/
├── types/              # TypeScript type definitions
│   ├── game.ts        # Card, player, and game state interfaces
│   └── az900.ts       # AZ-900 domain and service definitions
├── components/         # Reusable UI components
│   ├── cards/         # Card rendering components
│   ├── board/         # Game board components
│   └── ui/            # General UI components (buttons, modals)
├── engine/            # Game logic and business rules
│   ├── evaluator.ts   # Scenario evaluation logic
│   ├── deck-manager.ts # Card deck management
│   └── scoring.ts     # Score calculation utilities
├── stores/            # State management (Pinia/Zustand stores)
├── utils/             # Helper functions and utilities
├── assets/            # Static assets (images, fonts)
└── styles/            # Global styles and Tailwind configuration
```

### Component Architecture
* **Presentation Components**: Focus solely on rendering UI, no business logic
* **Smart Components**: Handle game state and user interactions
* **Compound Components**: For complex UI patterns like card decks and scenarios
* **Code Splitting**: Use dynamic imports for large game components

## Code Conventions & Best Practices

### Vue 3 Specific
```vue
<script setup lang="ts">
// Use Composition API with <script setup>
import { ref, computed } from 'vue'
import type { Card } from '@/types/game'

const props = defineProps<{
  card: Card
  isActive: boolean
}>()

const emit = defineEmits<{
  select: [cardId: string]
  discard: [cardId: string]
}>()

const cardClass = computed(() => ({
  'card-active': props.isActive,
  'card-inactive': !props.isActive,
  [`domain-${props.card.domain}`]: true
}))
</script>

<template>
  <div 
    :class="cardClass"
    @click="emit('select', card.id)"
    @contextmenu.prevent="emit('discard', card.id)"
  >
    <!-- Card content -->
  </div>
</template>
```

### React Specific
```tsx
import React from 'react'
import type { Card } from '@/types/game'

interface CardProps {
  card: Card
  isActive: boolean
  onSelect: (cardId: string) => void
  onDiscard: (cardId: string) => void
}

const CardComponent: React.FC<CardProps> = ({ 
  card, 
  isActive, 
  onSelect, 
  onDiscard 
}) => {
  const handleClick = () => onSelect(card.id)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    onDiscard(card.id)
  }

  return (
    <div 
      className={`card ${isActive ? 'card-active' : 'card-inactive'} domain-${card.domain}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Card content */}
    </div>
  )
}
```

### Type Definitions Example
```typescript
// src/types/game.ts
export interface AzureCard {
  id: string
  name: string
  domain: 'cloud-concepts' | 'azure-services' | 'management-governance'
  cost: number
  synergyTags: string[]
  az900ExamTip: string
  description: string
  power: number
  requirements?: string[]
}

export interface GameState {
  deck: AzureCard[]
  hand: AzureCard[]
  board: AzureCard[]
  currentScenario: Scenario
  playerScore: number
  round: number
}

export interface Scenario {
  id: string
  title: string
  description: string
  requirements: ScenarioRequirement[]
  constraints: string[]
  maxRounds: number
}

export interface ScenarioRequirement {
  type: 'service' | 'concept' | 'governance'
  value: string
  weight: number
}
```

## Development Workflow

### Git & Version Control
* **Branch Strategy**: Feature branches from `main` with descriptive names
* **Commit Messages**: Conventional Commits format
* **Code Review**: All PRs require review before merge
* **Git Hooks**: Pre-commit hooks for linting and type checking

### Testing Strategy
* **Unit Tests**: Vitest for Vue components, Jest for React
* **Component Tests**: Vue Testing Library or React Testing Library
* **Integration Tests**: Playwright for end-to-end game scenarios
* **Test Coverage**: Minimum 80% coverage for game engine logic

### Performance Optimization
* **Bundle Optimization**: Code splitting and lazy loading
* **Memory Management**: Proper cleanup of game state and event listeners
* **Rendering Performance**: Virtual scrolling for large card decks
* **Asset Optimization**: Compressed images and fonts

## Deployment & DevOps

### Build Configuration
* **Development**: Hot module replacement and source maps
* **Production**: Minification, tree-shaking, and chunk optimization
* **Environment Variables**: Separate configs for development, staging, production

### Hosting & CI/CD
* **Static Hosting**: Azure Static Web Apps, Vercel, or Netlify
* **CI/CD Pipeline**: Automated tests, linting, and deployment
* **Monitoring**: Error tracking and performance monitoring

## Accessibility & Internationalization

### Accessibility Requirements
* **WCAG 2.1 AA Compliance**: All game components must be accessible
* **Keyboard Navigation**: Full game control via keyboard
* **Screen Reader Support**: ARIA labels and semantic HTML
* **Color Contrast**: Minimum 4.5:1 ratio for text

### Internationalization (i18n)
* **Framework**: Vue I18n or react-i18next
* **Language Support**: English (primary), with expansion capability
* **Localization**: Date formats, number formats, and currency

## Security Considerations
* **Input Validation**: Sanitize all user inputs
* **XSS Protection**: Use framework-safe templating
* **API Security**: HTTPS-only communications
* **Data Protection**: Encrypt sensitive game state if persisted